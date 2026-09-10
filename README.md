# FUFI Fulfillment Demo

Dual-sided dark-mode fulfillment prototype for a Toronto-based operation.

## Views
- Customer: select vaulted items, enter an address, receive one locked shipping charge, pay it from cash balance only, request shipment, and track delivery.
- Fulfillment Ops: receive the paid request, verify items and destination, enter final parcel dimensions, compare eligible carriers, select the actual service, create a label, dispatch, and advance tracking.
- For Sam: implementation notes for carrier routing, serviceability, destination restrictions, and backend integration.

## Currency
USD is the base currency for the demo. Customer shipping charges, cash balance, Ops postage comparisons, margin calculations, archive records, and customs/insurance values are displayed in USD so the workflow does not mix CAD and USD.

## Pricing model
The customer never selects a carrier. The demo calculates the lowest eligible Toronto-origin simulated rate for the estimated parcel and adds a $1.25 cushion. That becomes the customer's locked shipping charge.

After the parcel is physically packed, Fulfillment Ops re-rates using the actual dimensions and weight and selects the actual carrier. The backend shows the difference between the customer charge and actual postage cost without re-quoting the customer.

Shipping is cash-only. Platform credits cannot be used toward fulfillment fees.

## Carrier selection
Carrier rows in Fulfillment Ops are explicitly clickable. The Best Fit option is preselected, each row includes a visible selection indicator, and the selected service receives a strong visual state. Fulfillment can still override the recommendation when speed, insurance, serviceability, or operational constraints justify another carrier.

## Shipping model
Canada uses Chit Chats, Canada Post, Purolator, and UPS as the main demo pool. U.S. orders prioritize Chit Chats with UPS, FedEx, and DHL alternatives. Overseas international orders exclude Chit Chats and Canada Post and instead use DHL, FedEx, UPS, or Purolator where appropriate.

Germany remains configured as an example blacklisted destination to demonstrate the existing Settings → Shipping → Service Areas rule.

## Run locally
Open `index.html` directly in a browser or serve the folder with VS Code Live Server.
