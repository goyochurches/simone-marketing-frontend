export interface PendingComment {
  id: string
  from: string
  handle: string
  comment: string
  receivedAt: string
  post: {
    productName: string
    caption: string
    color: string
  }
}
