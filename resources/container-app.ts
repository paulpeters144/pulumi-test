import * as azureNative from '@pulumi/azure-native';
import { IConfig } from '../config/config';
import { IResourceGroup } from './resource-group';
import { IContainerRegistry } from './container-registry';
import { IContainerIdentity } from '.';
import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';

export interface IContainerApp {}

class ContainerApp {
    constructor(props: ContainerAppProps) {
        const { config, resourceGroup, containerRegistry, containerIdentity } = props;

        const credentials = pulumi
            .all([resourceGroup.name, containerRegistry.name])
            .apply(([resourceGroupName, registryName]) =>
                azureNative.containerregistry.listRegistryCredentialsOutput({
                    resourceGroupName,
                    registryName,
                })
            );

        const adminUsername = credentials.username?.apply((c) => {
            return c!;
        })!;

        const adminPassword = credentials.apply((c) => {
            if (c.passwords && c.passwords.length > 0) {
                return c.passwords[0].value!;
            }
            throw new Error('admin Password not set');
        });

        const containerAppName = `pulumi-container-app-${config.env.lowerCase}`;
        const customImage = `pulumi-container-${config.env.lowerCase}`;

        const myImage = new docker.Image(customImage, {
            imageName: pulumi.interpolate`${containerRegistry.loginServer}/${customImage}:latest`,
            build: {
                context: `../api`,
                platform: 'linux/amd64',
                args: {
                    PORT: '80',
                },
            },
            registry: {
                server: containerRegistry.loginServer,
                username: adminUsername,
                password: adminPassword,
            },
        });

        const appServicePlan = new azureNative.web.AppServicePlan('appServicePlan', {
            resourceGroupName: resourceGroup.name,
            kind: 'Linux',
            reserved: true,
            sku: {
                name: 'B1',
                tier: 'Basic',
            },
        });

        const webAppName = `container-web-app-${config.env.lowerCase}`;
        const webApp = new azureNative.web.WebApp(webAppName, {
            resourceGroupName: resourceGroup.name,
            serverFarmId: appServicePlan.id,
            httpsOnly: true,
            siteConfig: {
                appSettings: [
                    { name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE', value: 'false' },
                    {
                        name: 'DOCKER_REGISTRY_SERVER_URL',
                        value: pulumi.interpolate`https://${containerRegistry.loginServer}`,
                    },
                    { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: adminUsername },
                    { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: adminPassword },
                    { name: 'WEBSITES_PORT', value: '80' },
                ],
                detailedErrorLoggingEnabled: true,
                alwaysOn: true,
                linuxFxVersion: myImage.imageName.apply((n) => `DOCKER|${n}`),
            },
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
