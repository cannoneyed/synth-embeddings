import * as _ from 'lodash'
const json = require('./3d_embeddings_v2.json')

export interface VariantTypes {
  [key: string]: string
}

export interface Data {
  data: PrimaryEntry[]
  variantTypes: VariantTypes
}

export interface Entry {
  index: number
  group: number
  proj: number[]
  filename: string
  displayName: string
}

export interface PrimaryEntry extends Entry {
  variants: { [key: string]: Entry }
}

// const processed = {}
interface PatchGroup {
  [key: string]: Entry
}
interface Group {
  [key: string]: PatchGroup
}

const grouped: Group = {}
json.data.forEach((entry: Entry) => {
  let [,folder,,filename] = entry.filename.split('/')
  if (filename === undefined) {
    return
  }
  filename = filename.replace('.mp3', '')
  let [patch, variant] = (filename as string).split('__')

  if (variant.startsWith('_')) {
    variant = variant.replace('_', '')
  }

  grouped[patch] = grouped[patch] || {}
  grouped[patch][variant] = entry

  entry.displayName = `${folder}/${patch}`
})

const processed: Data = { data: [], variantTypes: {} }
_.map(grouped, group => {
  const entry = group.base as PrimaryEntry
  entry.variants = {}

  _.map(group, (variant, key) => {
    processed.variantTypes[key] = key
    entry.variants[key] = variant;
  })

  processed.data.push(entry)
})

export const data = processed as Data
