import { describe, expect, it } from 'vitest'

import { applyConfig, LaunchConfig } from '@src/config'
import { Project, ProjectComponent } from '@src/project'
import { PackageJSON } from '@whimbrel/package-json'
import { WhimbrelContext } from '@whimbrel/core'
import { LaunchCommand } from '@src/launch'

describe('applyConfig', () => {
  const components: Record<string, (sel: boolean) => ProjectComponent> = {
    'great-cmp': (selected: boolean) => ({
      id: 'great-cmp',
      root: '',
      name: 'Great Component',
      package: '@project/great-cmp',
      pkgJson: null as unknown as PackageJSON,
      selected,
    }),
    'terrible-cmp': (selected: boolean) => ({
      id: 'terrible-cmp',
      root: '',
      name: 'Terrible Component',
      package: '@project/just-terrible',
      pkgJson: null as unknown as PackageJSON,
      selected,
    }),
    'awesome-cmp': (selected: boolean) => ({
      id: 'awesome-cmp',
      root: '',
      name: 'Cowabunga!',
      package: '@project/awesome-cmp',
      pkgJson: null as unknown as PackageJSON,
      selected,
    }),
  }

  const makeProject = (...cmps: [string, boolean][]): Project => {
    const selectedComponents = cmps.map(([id, selected]) =>
      components[id](selected)
    )
    return {
      id: 'my-project',
      ctx: null as unknown as WhimbrelContext,
      launchers: [
        {
          id: 'turbo',
          launchCommand: () => {
            return null as unknown as LaunchCommand
          },
          components: selectedComponents.map((c) => c.id),
        },
      ],
      root: '/tmp/somewhere',
      components: selectedComponents,
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
