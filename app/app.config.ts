export default defineAppConfig({
  ui: {
    button: {
      slots: { base: "rounded-lg" },
    },
    input: {
      slots: { base: "" },
      variants: {
        color: {
          brand: "",
          error: "",
        },
      },
      compoundVariants: [
        {
          color: "brand",
          variant: "outline",
          class: "focus-visible:ring-1 focus-visible:ring-orange-500",
        },
        {
          color: "error",
          variant: "outline",
          class: "focus-visible:ring-1 focus-visible:ring-red-500",
        },
      ],
      defaultVariants: {
        color: "primary",
      },
    },
    colors: {
      primary: 'brand',
    },
    modal: {
      slots: { overlay: "bg-gray-900/75 dark:bg-gray-900/90 backdrop-blur-sm" },
    },
    slideover: {
      slots: { overlay: "bg-gray-900/75 dark:bg-gray-900/90 backdrop-blur-sm" },
    }
  },
});
