export interface DmMessage {
  id: string
  text: string
  fromMe: boolean
  timestamp: string
}

export interface PendingDm {
  id: string
  from: string
  handle: string
  message: string
  receivedAt: string
  messages: DmMessage[]
}
