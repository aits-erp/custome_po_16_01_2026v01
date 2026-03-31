import frappe
import json
from frappe.utils import today

@frappe.whitelist()
def get_items_from_sales_orders(sales_orders):
    """
    Fetch items from multiple Sales Orders
    and return them for Purchase Order
    """

    # Convert string to list (if needed)
    if isinstance(sales_orders, str):
        sales_orders = json.loads(sales_orders)

    po_items = []

    for so_name in sales_orders:
        so = frappe.get_doc("Sales Order", so_name)

        for row in so.items:
            po_items.append({
                "item_code": row.item_code,
                "item_name": row.item_name,
                "description": row.description,
                "qty": row.qty,
                "rate": row.rate,
                "uom": row.uom,
                "schedule_date": today(),  # or row.delivery_date if you prefer
                "sales_order": so.name,
                "sales_order_item": row.name
            })

    return po_items