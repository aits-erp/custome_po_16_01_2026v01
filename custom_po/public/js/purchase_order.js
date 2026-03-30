frappe.ui.form.on("Purchase Order", {
  refresh(frm) {
    frm.add_custom_button(
      __("Sales Order"),
      () => {
        open_sales_order_dialog(frm);
      },
      __("Get Items From")
    );
  }
});

function open_sales_order_dialog(frm) {

  let dialog = new frappe.ui.form.MultiSelectDialog({
    doctype: "Sales Order",
    target: frm,

    // 🔹 FILTER FIELDS (VISIBLE)
    setters: {
      customer: null,
      status: null
    },

    // 🔹 QUERY WITH DYNAMIC FILTERS
    get_query() {
      let filters = {
        docstatus: ["in", [0, 1, 2]]
      };

      const customer = dialog.dialog.get_value("customer");
      const status = dialog.dialog.get_value("status");

    

      if (status) {
        filters.status = status;
      }

      return { filters };
    },

    action(selections) {
      if (!selections || !selections.length) {
        frappe.msgprint("Please select at least one Sales Order");
        return;
      }

      frappe.call({
        method: "custom_po.api.get_items_from_sales_orders",
        args: {
          sales_orders: selections
        },
        callback(r) {
          if (!r.message) return;

          // 🔹 Remove default empty row
          if (
            frm.doc.items &&
            frm.doc.items.length === 1 &&
            !frm.doc.items[0].item_code
          ) {
            frm.clear_table("items");
          }

          // 🔹 Add items
          r.message.forEach(row => {
            let d = frm.add_child("items");

            d.item_code = row.item_code;
            d.item_name = row.item_name;
            d.description = row.description;
            d.qty = row.qty;
            d.rate = row.rate;
            d.uom = row.uom;
            d.schedule_date = row.schedule_date;
            d.sales_order = row.sales_order;
            d.sales_order_item = row.sales_order_item;
            d.custom_so_cbm = row.custom_so_cbm || 0;

            frm.script_manager.trigger("qty", d.doctype, d.name);
            frm.script_manager.trigger("rate", d.doctype, d.name);
          });

          frm.refresh_field("items");
          frm.trigger("calculate_taxes_and_totals");

          dialog.dialog.hide();
        }
      });
    }
  });
    setTimeout(() => {
    dialog.dialog.fields_dict.customer &&
      dialog.dialog.fields_dict.customer.df &&
      dialog.dialog.fields_dict.customer.$wrapper.hide();
  }, 200);

  // 🔹 STATUS OPTIONS (VISIBLE, NOT HIDDEN)
  setTimeout(() => {
    if (dialog.dialog.fields_dict.status) {
      dialog.dialog.fields_dict.status.df.options = [
        "",
        "Draft",
        "To Deliver",
        "To Deliver and Bill",
        "To Bill",
        "Completed",
        "Closed",
        "On Hold"
      ];
      dialog.dialog.refresh();
    }
  }, 200);
}