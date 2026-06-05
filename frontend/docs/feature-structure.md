# Feature structure

## Рекомендуемый шаблон

Для крупной feature:

```txt
components/features/<feature>/
  <Feature>View.tsx
  components/
    ...
  hooks/
    ...
  lib/
    ...
  types.ts
  index.ts
```

## Пример checkout

```txt
components/features/checkout/
  CheckoutView.tsx
  components/
    CheckoutHeader.tsx
    CheckoutFooter.tsx
    TimingStep.tsx
    AddressStep.tsx
    ReviewStep.tsx
    NextStepsStep.tsx
    DatePickerButton.tsx
    ReviewRow.tsx
    SummaryRow.tsx
  hooks/
    useCheckoutStep.ts
    useCheckoutAvailability.ts
  lib/
    delivery-intervals.ts
    checkout-copy.ts
```

## Пример orders

```txt
components/features/orders/
  MyOrdersView.tsx
  components/
    OrdersTabs.tsx
    FeaturedOrderCard.tsx
    CompactOrderCard.tsx
    OrderDetailsView.tsx
    OrderProductHeader.tsx
    OrderIcon.tsx
    OrderFact.tsx
    DetailRow.tsx
    StatusInfoBlock.tsx
    ReviewBlock.tsx
    OrderActions.tsx
    EmptyOrdersState.tsx
  lib/
    orders-view.utils.ts
    order-actions.ts
```

## Пример operator

```txt
components/features/operator/
  OperatorDashboard.tsx
  components/
    OperatorTabs.tsx
    OperatorQueueTabs.tsx
    OperatorStats.tsx
    OperatorOrderCard.tsx
    OperatorSettingsPanel.tsx
  hooks/
    use-admin-orders.ts
  lib/
    operator-queues.ts
    operator-next-step.ts
```
