import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-300 group-[.toaster]:text-green-900",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-300 group-[.toaster]:text-red-900",
          warning:
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-300 group-[.toaster]:text-yellow-900",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-300 group-[.toaster]:text-blue-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
