import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    rfidNumber?: string | null
    rfidBalance?: number | null
    vendorId?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      rfidNumber?: string | null
      rfidBalance?: number | null
      vendorId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    rfidNumber?: string | null
    rfidBalance?: number | null
    vendorId?: string
  }
}
