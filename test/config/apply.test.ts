import { describe, expect, it } from 'vitest'

import { applyConfig, LaunchConfig } from '@src/config'
import { Project, ProjectComponent } from '@src/project'
import { PackageJSON } from '@whimbrel/package-json'
import { WhimbrelContext } from '@whimbrel/core'
import { LaunchCommand } from '@src/launch'
import { LaunchSession } from '@src/project/state'

describe('applyConfig', () => {
  const components: Record<string, ProjectComponent> = {
    'great-cmp': {
      id: 'great-cmp',
      type: 'pkgjson-script',
      root: '',
      name: 'Great Component',
      package: '@project/great-cmp',
      pkgJson: null as unknown as PackageJSON,
      targets: ['dev', 'build'],
    },
    'terrible-cmp': {
      id: 'terrible-cmp',
      type: 'pkgjson-script',
      root: '',
      name: 'Terrible Component',
      package: '@project/just-terrible',
      pkgJson: null as unknown as PackageJSON,
      targets: ['dev', 'build'],
    },
    'awesome-cmp': {
      id: 'awesome-cmp',
      type: 'pkgjson-script',
      root: '',
      name: 'Cowabunga!',
      package: '@project/awesome-cmp',
      pkgJson: null as unknown as PackageJSON,
      targets: ['dev', 'build'],
    },
  }

  const makeProject = (...cmps: string[]): Project => {
    const selectedComponents = cmps.map((id) => components[id])
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
    } as unknown as Project
  }

  it('should select all components if the launchConfig is empty (no previous launch)', () => {
    // Given
    const launchConfig: LaunchConfig = {
      defaultTarget: 'dev',
      components: {},
    }

    const project = makeProject('great-cmp', 'terrible-cmp', 'awesome-cmp')
    const session: LaunchSession = { components: [], target: 'dev' }

    // When
    applyConfig(launchConfig, project, session)

    // Then
    expect(session.components.map((c) => c.state.selected)).toEqual([
      true,
      true,
      true,
    ])
  })

  it('should select default targets is empty (no previous launch)', () => {
    // Given
    const launchConfig: LaunchConfig = {
      defaultTarget: 'dev',
      components: {},
    }

    const project = makeProject('great-cmp', 'terrible-cmp', 'awesome-cmp')
    const session: LaunchSession = { components: [], target: 'dev' }

    // When
    applyConfig(launchConfig, project, session)

    // Then
    expect(session.components.map((c) => c.state.targets)).toEqual([
      ['dev'],
      ['dev'],
      ['dev'],
    ])
  })

  it('should select components marked as selected in launch config', () => {
    // Given
    const launchConfig: LaunchConfig = {
      defaultTarget: 'dev',
      components: {
        'great-cmp': {
          selected: true,
          targets: [],
        },
        'terrible-cmp': {
          selected: false,
          targets: [],
        },
        'awesome-cmp': {
          selected: true,
          targets: [],
        },
      },
    }

    const project = makeProject('great-cmp', 'terrible-cmp', 'awesome-cmp')
    const session: LaunchSession = { components: [], target: 'dev' }

    // When
    applyConfig(launchConfig, project, session)

    // Then
    expect(session.components.map((c) => c.state.selected)).toEqual([
      true,
      false,
      true,
    ])
  })

  it('should mark components not present in config as selected=false', () => {
    // Given
    const launchConfig: LaunchConfig = {
      defaultTarget: 'dev',
      components: {
        'great-cmp': {
          selected: true,
          targets: [],
        },
      },
    }

    const project = makeProject('great-cmp', 'terrible-cmp', 'awesome-cmp')
    const session: LaunchSession = { components: [], target: 'dev' }

    // When
    applyConfig(launchConfig, project, session)

    // Then
    expect(session.components.map((c) => c.state.selected)).toEqual([
      true,
      false,
      false,
    ])
  })
})
