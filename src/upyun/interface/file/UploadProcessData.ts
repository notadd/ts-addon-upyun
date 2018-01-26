export interface UploadProcessData {
  code: number
  message: string
  method: string
  url: string
  form: {
    policy: string
    authorization: string
  }
}