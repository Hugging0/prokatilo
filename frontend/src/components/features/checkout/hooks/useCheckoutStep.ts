import { useState } from "react";

export function useCheckoutStep() {
  return useState(1);
}
