import * as azureNative from "@pulumi/azure-native";
import { IConfig } from "../config/config";
import { IResourceGroup } from "./resource-group";
import { Output } from "@pulumi/pulumi";
import { IVirtualNetwork } from "./virtual-network";

export interface IContainerAppEnv {
    id: Output<string>;
}

class ContainerAppEnv {
    get id(): Output<string> {
        return this._value.id;
    }

    private _value: azureNative.app.ManagedEnvironment;

    constructor({ config, resourceGroup, virtualNetwork }: ContainerAppEnvProps) {
        const name = `pulumi-container-app-env-${config.env.lowerCase}`
        this._value = new azureNative.app.ManagedEnvironment(name, {
            resourceGroupName: resourceGroup.name,
            location: resourceGroup.location,
            environmentName: name,
            sku: {
                name: "Consumption",
            },
            vnetConfiguration: {
                infrastructureSubnetId: virtualNetwork.subnetId,
            }
        });
    }
}

interface ContainerAppEnvProps {
    config: IConfig;
    resourceGroup: IResourceGroup;
    virtualNetwork: IVirtualNetwork;
}

export function createContainerAppEnv(props: ContainerAppEnvProps): IContainerAppEnv {
    return new ContainerAppEnv(props);
}