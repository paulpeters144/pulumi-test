import * as azureNative from '@pulumi/azure-native';
import { IConfig } from '../config/config';
import { IResourceGroup } from './resource-group';
import { IContainerRegistry } from './container-registry';
import { IContainerIdentity } from '.';

export interface IContainerApp {}

class ContainerApp {
    constructor(props: ContainerAppProps) {
        const { config, resourceGroup, containerRegistry, containerIdentity } = props;

        const containerAppName = `pulumi-container-app-${config.env.lowerCase}`;
        const containerName = `pulumi-container-${config.env.lowerCase}`;

        const appServicePlan = new azureNative.web.AppServicePlan('appServicePlan', {
            resourceGroupName: resourceGroup.name,
            kind: 'Linux',
            reserved: true,
            sku: {
                name: 'B1',
                tier: 'Basic',
            },
        });

        const name = `container-web-app-${config.env.lowerCase}`;
        const webApp = new azureNative.web.WebApp(name, {
            resourceGroupName: resourceGroup.name,
            name: name,
            serverFarmId: appServicePlan.id,
            identity: {
                type: azureNative.containerinstance.ResourceIdentityType.UserAssigned,
                userAssignedIdentities: [containerIdentity.id],
            },
            siteConfig: {
                linuxFxVersion:
                    'DOCKER|pulumicontainerregistryuat.azurecr.io/' +
                    'pulumi-container-app-uat:latest',
                acrUseManagedIdentityCreds: true,
                acrUserManagedIdentityID: containerIdentity.acrPullId,
            },
            httpsOnly: true,
        });
    }
}

interface ContainerAppProps {
    config: IConfig;
    resourceGroup: IResourceGroup;
    containerRegistry: IContainerRegistry;
    containerIdentity: IContainerIdentity;
}

export function createContainerApp(props: ContainerAppProps): IContainerApp {
    return new ContainerApp(props);
}
