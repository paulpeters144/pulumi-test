import { createConfig, IConfig } from './config/config';
import * as resource from './resources';

const config: IConfig = createConfig();

const resourceGroup = resource.createResourceGroup({
    config,
});

const containerRegistry = resource.createContainerRegistry({
    config,
    resourceGroup,
});

const containerApp = resource.createContainerApp({
    config,
    resourceGroup,
    containerRegistry,
});
