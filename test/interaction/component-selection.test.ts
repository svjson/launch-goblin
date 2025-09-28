import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('Interaction', () => {
  describe('Node Packages Only', () => {
    describe('Component Selection', () => {
      it('should be possible to cycle through the components using arrow-down', () => {
        // Given
        const { adapter, backend } = runGoblinApp({
          projectId: 'dummy-project',
        })
        const cmpSection = adapter.componentSection()

        // Then - the first component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

        // When - arrow down
        backend.performKeyPress('down')
        // Then - the second component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('frontend-portal')

        // When - arrow down
        backend.performKeyPress('down')
        // Then - the third component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-a')

        // When - arrow down
        backend.performKeyPress('down')
        // Then - the last component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-b')

        // When - arrow down
        backend.performKeyPress('down')
        // Then - selection has cycled back to the first component
        expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
      })

      it('should be possible to cycle through the components using arrow-up', () => {
        // Given
        const { backend, adapter } = runGoblinApp({
          projectId: 'dummy-project',
        })
        const cmpSection = adapter.componentSection()

        // Then - the first component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

        // When - arrow down
        backend.performKeyPress('up')
        // Then - the last component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-b')

        // When - arrow up
        backend.performKeyPress('up')
        // Then - the third component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-a')

        // When - arrow up
        backend.performKeyPress('up')
        // Then - the second component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('frontend-portal')

        // When - arrow up
        backend.performKeyPress('up')
        // Then - selection has cycled back to the first component
        expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
      })

      it('should be possible to toggle selection with enter', () => {
        // Given
        const { state, backend, adapter } = runGoblinApp({
          projectId: 'dummy-project',
        })
        const cmpSection = adapter.componentSection()

        // Then
        expect(cmpSection.isFocusedComponentChecked()).toBe(true)
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          true,
          true,
          true,
          true,
        ])

        // When - press enter
        backend.performKeyPress('enter')
        // Then - Box has been unchecked
        expect(cmpSection.isFocusedComponentChecked()).toBe(false)
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          false,
          true,
          true,
          true,
        ])

        // When - press enter
        backend.performKeyPress('enter')
        // Then - Box has been checked
        expect(cmpSection.isFocusedComponentChecked()).toBe(true)
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          true,
          true,
          true,
          true,
        ])
      })

      describe('Single Target Option', () => {
        it('should be possible to cycle through script targets with arrow right', () => {
          // Given
          const { state, backend, adapter } = runGoblinApp({
            projectId: 'dummy-project',
          })
          const cmpSection = adapter.componentSection()

          // Then
          expect(cmpSection.isFocusedComponentChecked()).toBe(true)
          expect(state.session.components.map((c) => c.state.targets)).toEqual([
            ['dev'],
            ['dev'],
            ['dev'],
            ['dev'],
          ])

          // When - press arrow right
          backend.performKeyPress('right')
          // Then - The next script has been selected
          expect(cmpSection.isFocusedComponentChecked()).toBe(true)
          expect(state.session.components.map((c) => c.state.targets)).toEqual([
            ['dev:local'],
            ['dev'],
            ['dev'],
            ['dev'],
          ])

          // When - press arrow right
          backend.performKeyPress('right')
          // Then - The next script has been selected
          expect(cmpSection.isFocusedComponentChecked()).toBe(true)
          expect(state.session.components.map((c) => c.state.targets)).toEqual([
            ['test'],
            ['dev'],
            ['dev'],
            ['dev'],
          ])

          // When - press arrow right
          backend.performKeyPress('right')
          // Then - The next script has been selected
          expect(cmpSection.isFocusedComponentChecked()).toBe(true)
          expect(state.session.components.map((c) => c.state.targets)).toEqual([
            ['typecheck'],
            ['dev'],
            ['dev'],
            ['dev'],
          ])

          // When - press arrow right
          backend.performKeyPress('right')
          // Then - The selected script has cycled back to 'dev'
          expect(cmpSection.isFocusedComponentChecked()).toBe(true)
          expect(state.session.components.map((c) => c.state.targets)).toEqual([
            ['dev'],
            ['dev'],
            ['dev'],
            ['dev'],
          ])
        })
      })
    })
  })

  describe('Node and Docker Compose Components', () => {
    it('should be possible to cycle through the components using arrow-down', () => {
      // Given
      const { adapter, backend } = runGoblinApp({
        projectId: 'dummy-with-docker-compose',
      })
      const cmpSection = adapter.componentSection()

      // Then - the first component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('frontdesk-service')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the second component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('frontend')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - then docker compose component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual(
        'docker-compose.yaml'
      )

      // When - arrow down
      backend.performKeyPress('down')
      // Then - then first docker compose service is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('sql')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - then second docker compose service is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('kibana')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - then last docker compose service is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('elasticsearch')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - selection has cycled back to the first component
      expect(cmpSection.getFocusedComponentName()).toEqual('frontdesk-service')
    })

    describe('Selecting Target Children', () => {
      it('should uncheck parent when all children are unchecked', () => {
        // Given
        const { adapter, state, backend } = runGoblinApp({
          projectId: 'dummy-with-docker-compose',
        })
        const dcCmp = state.session.components.at(-1)!
        const cmpSection = adapter.componentSection()

        // Then - All docker compose services are selected
        expect(dcCmp.state.targets).toEqual(['sql', 'kibana', 'elasticsearch'])

        // Then - the first component is selected
        expect(cmpSection.getFocusedComponentName()).toEqual(
          'frontdesk-service'
        )

        // When - arrow up
        backend.performKeyPress('up')
        // Then - the last docker compose service is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('elasticsearch')

        // When - press enter
        backend.performKeyPress('enter')
        // Then - Service box has been unchecked
        expect(cmpSection.isFocusedComponentChecked()).toBe(false)
        expect(dcCmp.state.targets).toEqual(['sql', 'kibana'])
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          true,
          true,
          true,
        ])

        // When - arrow up
        backend.performKeyPress('up')
        // Then - the previous docker compose service is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('kibana')

        // When - press enter
        backend.performKeyPress('enter')
        // Then - Service has been checked
        expect(cmpSection.isFocusedComponentChecked()).toBe(false)
        expect(dcCmp.state.targets).toEqual(['sql'])
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          true,
          true,
          true,
        ])

        // When - arrow up
        backend.performKeyPress('up')
        // Then - the previous docker compose service is selected
        expect(cmpSection.getFocusedComponentName()).toEqual('sql')

        // When - press enter
        backend.performKeyPress('enter')
        // Then - Service has been checked
        expect(cmpSection.isFocusedComponentChecked()).toBe(false)
        expect(dcCmp.state.targets).toEqual([])
        // Then - Docker Compose parent component has been unchecked
        expect(state.session.components.map((c) => c.state.selected)).toEqual([
          true,
          true,
          false,
        ])
      })
    })
  })
})
