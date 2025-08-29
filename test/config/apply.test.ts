import { describe, expect, it } from 'vitest'

import { applyConfig, LaunchConfig } from '@src/config'
import { Project, ProjectComponent } from '@src/project'

describe('applyConfig', () => {
  const components: Record<string, (sel: boolean) => ProjectComponent> = {
    'great-cmp': (selected: boolean) => ({
      id: 'great-cmp',
      name: 'Great Component',
      package: '@project/great-cmp',
      selected,
    }),
    'terrible-cmp': (selected: boolean) => ({
      id: 'terrible-cmp',
      name: 'Terrible Component',
      package: '@project/just-terrible',
      selected,
    }),
    'awesome-cmp': (selected: boolean) => ({
      id: 'awesome-cmp',
      name: 'Cowabunga!',
      package: '@project/awesome-cmp',
      selected,
    }),
  }

  const makeProject = (...cmps: [string, boolean][]): Project => {
    return {
      id: 'my-project',
      root: '/tmp/somewhere',
      components: cmps.map(([id, selected]) => components[id](selected)),
    }
  }

  it('should select all components if the launchConfig is empty (no previous launch)', () => {
    // Given
    const launchConfig: LaunchConfig = {
      components: {},
    }

    const project = makeProject(
      ['great-cmp', false],
      ['terrible-cmp', false],
      ['awesome-cmp', false]
    )

    // When
    applyConfig(launchConfig, project)

    // Then
    expect(project.components.map((c) => c.selected)).toEqual([
      true,
      true,
      true,
    ])
  })

  it('should select components marked as selected in launch config', () => {
    // Given
    const launchConfig: LaunchConfig = {
      components: {
        'great-cmp': {
          selected: true,
        },
        'terrible-cmp': {
          selected: false,
        },
        'awesome-cmp': {
          selected: true,
        },
      },
    }

    const project = makeProject(
      ['great-cmp', false],
      ['terrible-cmp', false],
      ['awesome-cmp', false]
    )

    // When
    applyConfig(launchConfig, project)

    // Then
    expect(project.components.map((c) => c.selected)).toEqual([
      true,
      false,
      true,
    ])
  })

  it('should mark components not present in config as selected=false', () => {
    // Given
    const launchConfig: LaunchConfig = {
      components: {
        'great-cmp': {
          selected: true,
        },
      },
    }

    const project = makeProject(
      ['great-cmp', true],
      ['terrible-cmp', true],
      ['awesome-cmp', true]
    )

    // When
    applyConfig(launchConfig, project)

    // Then
    expect(project.components.map((c) => c.selected)).toEqual([
      true,
      false,
      false,
    ])
  })
})
