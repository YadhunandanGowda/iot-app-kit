import Box from '@cloudscape-design/components/box';
import React, { useState } from 'react';

import { AssetExplorer } from './assetExplorer';
import { ModeledDataStreamExplorer } from './modeledDataStreamExplorer';
import { AssetSummary, IoTSiteWiseClient } from '@aws-sdk/client-iotsitewise';
import { ModeledDataStream } from './modeledDataStreamExplorer/types';
import { IoTTwinMakerClient } from '@aws-sdk/client-iottwinmaker';
import { BROWSE_SEGMENT_ID, BrowseSearchToggle, useBrowseSearchToggle } from './browseSearchToggle';
import { useSearch } from '../dataStreamSearch/useSearch';
import { SearchFields } from '../dataStreamSearch/types';
import { DataStreamSearch } from '../dataStreamSearch';

export interface ModeledDataStreamQueryEditorProps {
  onClickAdd: (modeledDataStreams: ModeledDataStream[]) => void;
  iotSiteWiseClient: IoTSiteWiseClient;
  iotTwinMakerClient: IoTTwinMakerClient;
}

export function ModeledDataStreamQueryEditor({
  onClickAdd,
  iotSiteWiseClient,
  iotTwinMakerClient,
}: ModeledDataStreamQueryEditorProps) {
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | undefined>(undefined);
  function handleOnSelectAsset(asset?: AssetSummary) {
    setSelectedAsset(asset);
  }

  const { selectedSegment, onChangeSegment } = useBrowseSearchToggle();

  const [searchFieldValues, setSearchFieldValues] = useState<SearchFields>({
    workspace: null,
    searchQuery: '',
  });

  const workspaceId =
    searchFieldValues.workspace != null && 'value' in searchFieldValues.workspace
      ? searchFieldValues.workspace.value
      : undefined;

  const { modeledDataStreams } = useSearch({
    workspaceId: workspaceId ?? '',
    client: iotTwinMakerClient,
    searchQuery: searchFieldValues.searchQuery,
  });

  return (
    <Box padding={{ horizontal: 's' }}>
      <BrowseSearchToggle selectedSegment={selectedSegment} onChange={onChangeSegment} />

      {selectedSegment === BROWSE_SEGMENT_ID ? (
        <>
          <AssetExplorer client={iotSiteWiseClient} onSelect={handleOnSelectAsset} />
          <ModeledDataStreamExplorer
            client={iotSiteWiseClient}
            onClickAddModeledDataStreams={onClickAdd}
            selectedAssetId={selectedAsset?.id}
          />
        </>
      ) : (
        <>
          <DataStreamSearch onSubmit={setSearchFieldValues} client={iotTwinMakerClient} />
          <ModeledDataStreamExplorer
            client={iotSiteWiseClient}
            onClickAddModeledDataStreams={onClickAdd}
            dataStreams={modeledDataStreams}
          />
        </>
      )}
    </Box>
  );
}
