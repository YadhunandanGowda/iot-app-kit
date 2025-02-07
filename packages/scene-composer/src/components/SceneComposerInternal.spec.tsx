import * as React from 'react';
import { act, create } from 'react-test-renderer';
import { cleanup, renderHook } from '@testing-library/react-hooks';
import str2ab from 'string-to-arraybuffer';
import flushPromises from 'flush-promises';
import { Object3D, Event, Mesh, MeshBasicMaterial, Color } from 'three';

import { SceneComposerInternal, useSceneComposerApi, SceneComposerApi } from '..';
import { testScenes } from '../../tests/testData';
import { useStore } from '../store';

jest.mock('../layouts/StaticLayout', () => ({
  StaticLayout: 'StaticLayout',
}));

jest.mock((window as any).ResizeObserver, () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// @ts-ignore
jest.mock('scheduler', () => require('scheduler/unstable_mock'));
jest.mock('resize-observer-polyfill', () => {
  return ResizeObserver;
});

const object3D = new Object3D<Event>();
const redColor = new Color('red');
const blueColor = new Color('blue');
const mesh = new Mesh(undefined, new MeshBasicMaterial({ color: redColor }));
object3D.children.push(mesh);

const sceneComposerId = 'test';

function createSceneLoaderMock(sceneContent: string) {
  return {
    getSceneUri: () => Promise.resolve('file://test.json'),
    getSceneUrl: () => Promise.resolve('file://test.json'),
    getSceneObject: () => Promise.resolve(str2ab(sceneContent)),
  };
}

describe('SceneComposerInternal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSceneComposerApi', () => {
    it('should return an api object', async () => {
      let sut: SceneComposerApi | null = null;

      await act(async () => {
        const TestComponent = () => {
          const sceneComposerId = 'test';
          sut = useSceneComposerApi('test');

          return (
            <SceneComposerInternal
              sceneComposerId={sceneComposerId}
              config={{ mode: 'Editing' }}
              sceneLoader={createSceneLoaderMock(testScenes.scene1)}
            />
          );
        };

        create(<TestComponent />);

        await flushPromises();
      });

      expect(sut).toHaveProperty('setCameraTarget');
    });

    it('should highlight and clear a scene node', async () => {
      const TestComponent = () => {
        return (
          <SceneComposerInternal
            sceneComposerId={sceneComposerId}
            config={{ mode: 'Editing' }}
            sceneLoader={createSceneLoaderMock(testScenes.waterTank)}
          />
        );
      };

      await act(async () => {
        create(<TestComponent />);

        await flushPromises();
      });

      //mocking after the scene loads so this doesn't get overwritten
      act(() => {
        useStore(sceneComposerId).setState({
          getObject3DBySceneNodeRef: () => object3D,
        });
      });

      const composerApi = renderHook(() => useSceneComposerApi('test')).result.current;

      act(() => {
        composerApi.highlights([
          {
            dataBindingContext: {
              entityId: 'WaterTank',
            },
            style: {
              color: 'blue',
            },
          },
        ]);
      });
      expect(mesh.material.color.getHex()).toBe(blueColor.getHex());
      act(() => {
        composerApi.clearHighlights([
          {
            entityId: 'WaterTank',
          },
        ]);
      });
      expect(mesh.material.color.getHex()).toBe(redColor.getHex());

      cleanup();
    });
  });
});
