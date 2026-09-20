import "react";

export {};

declare global {
  interface ShopifyAppBridge {
    idToken(): Promise<string>;
    toast: {
      show(message: string, options?: { isError?: boolean; duration?: number }): void;
    };
  }

  interface Window {
    shopify?: ShopifyAppBridge;
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ui-nav-menu": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
