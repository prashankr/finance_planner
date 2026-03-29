import { navItems } from "./lib/appData";

test("defines the core navigation areas", () => {
  expect(navItems).toHaveLength(6);
  expect(navItems.map((item) => item.href)).toContain("/alerts");
});
