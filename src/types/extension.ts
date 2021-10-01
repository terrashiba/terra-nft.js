export interface Extension {
  image?: string
  image_data?: string
  external_url?: string
  description?: string
  name?: string
  attributes?: Trait[]
  background_color?: string
  nimation_url?: string
  youtube_url?: String
}

interface Trait {
  display_type?: string
  trait_type: string
  value: string
}