/* eslint-disable no-unused-vars */

export type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (config: { client_id: string, login_uri: string }) => void
      renderButton: (element: HTMLElement | null, options: {
        theme?: string,
        size?: string,
        type?: string,
        text?: string,
        shape?: string,
        logo_alignment?: string
      }) => void
      // prompt?: () => void // Optional: Uncomment if using One Tap
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}
