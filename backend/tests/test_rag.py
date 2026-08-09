from ai.rag import ProductRetriever


def test_review_context_retrieval(tmp_path):
    r = ProductRetriever(persist_dir=str(tmp_path), collection_name="products")
    r.upsert_reviews(
        [
            {"id": 1, "productId": 10, "userId": 1, "rating": 5, "comment": "Excellent laptop", "user_name": "A"},
            {"id": 2, "productId": 10, "userId": 2, "rating": 3, "comment": "Average battery", "user_name": "B"},
            {"id": 3, "productId": 20, "userId": 3, "rating": 4, "comment": "Nice phone", "user_name": "C"},
        ]
    )

    ctx = r.get_review_summary_context(10)
    assert len(ctx) == 2
    assert all(m["productId"] == 10 for m in ctx)
    assert {m["id"] for m in ctx} == {1, 2}

    # product with no reviews -> empty, no crash
    assert r.get_review_summary_context(999) == []


def test_delete_reviews_for_product(tmp_path):
    r = ProductRetriever(persist_dir=str(tmp_path), collection_name="products")
    r.upsert_reviews(
        [
            {"id": 1, "productId": 10, "userId": 1, "rating": 5, "comment": "Great"},
            {"id": 2, "productId": 10, "userId": 2, "rating": 2, "comment": "Poor"},
            {"id": 3, "productId": 11, "userId": 1, "rating": 4, "comment": "Fine"},
        ]
    )
    r.delete_reviews_for_product(10)
    assert r.get_review_summary_context(10) == []
    assert len(r.get_review_summary_context(11)) == 1


def test_products_and_reviews_collections_are_separate(tmp_path):
    r = ProductRetriever(persist_dir=str(tmp_path), collection_name="products")
    r.upsert_products([{"pid": 10, "name": "Laptop", "price": 100, "cid": 1, "quantity": 5, "discount": 0}])
    r.upsert_reviews([{"id": 1, "productId": 10, "userId": 1, "rating": 5, "comment": "Great"}])

    assert r.search("laptop", top_k=1)[0]["pid"] == 10
    assert len(r.get_review_summary_context(10)) == 1
    # deleting the product from the products collection must not touch reviews
    r.delete_product(10)
    assert r.search("laptop", top_k=1) == []
    assert len(r.get_review_summary_context(10)) == 0  # delete_product cleans reviews too
