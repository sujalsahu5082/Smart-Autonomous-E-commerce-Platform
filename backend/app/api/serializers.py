from app.models import Product


def product_to_out(product: Product) -> dict:
    return {
        "pid": product.pid,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "quantity": product.quantity,
        "discount": product.discount,
        "image": product.image,
        "tags": product.tags or [],
        "cid": product.cid,
        "category_name": product.category.name if product.category else None,
        "price_after_discount": product.price_after_discount,
    }
