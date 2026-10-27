export default defineAppConfig({
  ui: {
    formField: {
      slots: {
        container: "relative",
        error: "text-xs text-error mt-1 absolute top-full left-0 right-0",
      },
    },
    button: {
      slots: { base: "rounded-lg" },
    },
    input: {
      slots: { base: "placeholder:text-sm text-sm" },
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
    textarea: {
      slots: { base: "placeholder:text-sm text-sm" },
    },
    select: {
      slots: {
        base: "text-sm",
        placeholder: "text-sm",
      },
    },
    colors: {
      primary: 'brand',
    },
    modal: {
      slots: {
        overlay: "!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm",
      },
      variants: {
        overlay: {
          true: {
            overlay: "!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm",
          },
        },
      },
    },
    slideover: {
      slots: {
        overlay: "!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm",
      },
    },
    drawer: {
      slots: {
        overlay: "!bg-gray-900/75 dark:!bg-gray-900/90 !backdrop-blur-sm",
      },
    },
  },
});
