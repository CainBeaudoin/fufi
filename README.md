# FUFI Fulfillment Demo

Dual-sided dark-mode fulfillment prototype for a Toronto-based operation.

## Views
- Customer: select vaulted items, enter an address, receive one locked shipping charge, pay it from cash balance only, request shipment, and track delivery.
- Fulfillment Ops: receive the paid request, verify items and destination, enter final parcel dimensions, compare eligible carriers, select the actual service, create a label, dispatch, and advance tracking.

## Pricing model
The customer never selects a carrier. The demo calculates the lowest eligible Toronto-origin simulated rate for the estimated parcel and adds a C$1.25 cushion. That becomes the customer's locked shipping charge.

After the parcel is physically packed, Fulfillment Ops re-rates using the actual dimensions and weight and selects the actual carrier. The backend shows the difference between the customer charge and actual postage cost without re-quoting the customer.

Shipping is cash-only. Platform credits cannot be used toward fulfillment fees.

## Shipping model
The current demo uses illustrative simulated rates, including local Toronto, Canada, U.S., UAE/Dubai, and other international examples. It is designed so Chit Chats can be the primary Canada/U.S. integration, with additional carriers added through adapters later.

Germany remains configured as an example blacklisted destination to demonstrate the existing Settings → Shipping → Service Areas rule.

## Run locally
Open `index.html` directly in a browser or serve the folder with VS Code Live Server.
