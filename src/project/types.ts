export interface Project {
  id: string
  root: string
  components: ProjectComponent[]
}

export interface BaseComponent {
  id: string
  name: string
  selected?: boolean
}

export interface Package {
  package: string
}

export type NodePackage = BaseComponent & Package

export type ProjectComponent = NodePackage
