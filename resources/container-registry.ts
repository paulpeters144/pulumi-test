import * as azureNative from '@pulumi/azure-native';
import { IConfig } from '../config/config';
import { IResourceGroup } from './resource-group';
import { Output, all } from '@pulumi/pulumi';

export interface IContainerRegistry {
    loginServer: Output<string>;
    username: Output<string>;
    passwordRef: Output<string>;
    id: Output<string>;
    name: Output<string>;
}

type RegistryCredentialsResult =
    azureNative.containerregistry.ListRegistryCredentialsResult;

class ContainerRegistry {
    get loginServer(): Output<string> {
        return this._value.loginServer;
    }

    get id(): Output<string> {
        return this._value.loginServer;
    }

    get username(): Output<string> {
        const username = this._credentials.username;
        return username as Output<string>;
    }

    get name(): Output<string> {
        return this._value.name;
    }

    get passwordRef(): Output<string> {
        const passwordRef = this._credentials.apply((creds) => {
            if (creds.passwords && creds.passwords.length > 0) {
                return creds.passwords[0].value;
            }
            return undefined;
        });
        return passwordRef as Output<string>;
    }

    private _value: azureNative.containerregistry.Registry;
    private _credentials: Output<RegistryCredentialsResult>;
    constructor({ config, resourceGroup }: ContainerRegistryProps) {
        const name = `pulumiContainerRegistry${config.env.pascalCase}`;
        this._value = new azureNative.containerregistry.Registry(name, {
            resourceGroupName: resourceGroup.name,
            registryName: name,
            location: resourceGroup.location,
            sku: {
                name: 'Basic',
            },
            adminUserEnabled: true,
        });

        this._credentials = all([resourceGroup.name, this._value.name]).apply(
            ([resourceGroupName, registryName]) => {
                return azureNative.containerregistry.listRegistryCredentials({
                    resourceGroupName: resourceGroupName,
                    registryName: registryName,
                });
            }
        );
    }
}

interface ContainerRegistryProps {
    config: IConfig;
    resourceGroup: IResourceGroup;
}

export function createContainerRegistry({
    config,
    resourceGroup,
}: ContainerRegistryProps): IContainerRegistry {
    return new ContainerRegistry({
        config,
        resourceGroup,
    });
}
