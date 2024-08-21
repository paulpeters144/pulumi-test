import * as azureNative from '@pulumi/azure-native';
import { IConfig } from '../config/config';
import { IResourceGroup } from './resource-group';
import { Output } from '@pulumi/pulumi';
import { IContainerRegistry } from './container-registry';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';

export interface IContainerIdentity {
    id: Output<string>;
    acrPullId: Output<string>;
}

class ContainerIdentity {
    get id(): Output<string> {
        return this._value.id;
    }

    get acrPullId(): Output<string> {
        return this._acrRole.id;
    }

    private _value: azureNative.managedidentity.UserAssignedIdentity;

    private _acrRole: azureNative.authorization.RoleAssignment;

    constructor(props: ContainerItentityProps) {
        const { config, resourceGroup, containerRegistry } = props;
        const name = `pulumi-container-identity-${config.env.lowerCase}`;
        this._value = new azureNative.managedidentity.UserAssignedIdentity(name, {
            resourceGroupName: resourceGroup.name,
        });

        const acrPullDef = `7f951dda-4ed3-4680-a7ca-43fe172d538d`;
        const acrPullRoleDefinitionId =
            `/subscriptions/${config.subscriptionId}/providers/` +
            `Microsoft.Authorization/roleDefinitions/${acrPullDef}`;

        const n = 'acrPullRoleAssignment';
        this._acrRole = new azureNative.authorization.RoleAssignment(n, {
            principalId: this._value.principalId,
            principalType: azureNative.authorization.PrincipalType.ServicePrincipal,
            roleAssignmentName: pulumi.output(new random.RandomUuid('uuid').result),
            roleDefinitionId: acrPullRoleDefinitionId,
            scope: pulumi.interpolate`/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroup.name}`,
        });
    }
}

interface ContainerItentityProps {
    config: IConfig;
    resourceGroup: IResourceGroup;
    containerRegistry: IContainerRegistry;
}

export function createContainerIdentity(
    props: ContainerItentityProps
): IContainerIdentity {
    return new ContainerIdentity(props);
}
