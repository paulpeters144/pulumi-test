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

const containerIdentity = resource.createContainerIdentity({
    config,
    resourceGroup,
    containerRegistry,
});

const containerApp = resource.createContainerApp({
    config,
    resourceGroup,
    containerRegistry,
    containerIdentity,
});
