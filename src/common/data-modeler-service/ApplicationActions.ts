import { DataModelerActions } from "$common/data-modeler-service/DataModelerActions";
import type {
  ApplicationState,
  ApplicationStateActionArg,
} from "$common/data-modeler-state-service/entity-state-service/ApplicationEntityService";
import {
  EntityRecord,
  EntityStateActionArg,
  EntityType,
  StateType,
} from "$common/data-modeler-state-service/entity-state-service/EntityStateService";
import { DatabaseActionQueuePriority } from "$common/priority-action-queue/DatabaseActionQueuePriority";

export class ApplicationActions extends DataModelerActions {
  @DataModelerActions.ApplicationAction()
  public async setActiveAsset(
    { stateService }: ApplicationStateActionArg,
    entityType: EntityType,
    entityId: string
  ) {
    const currentActiveAsset = (
      stateService.getCurrentState() as ApplicationState
    ).activeEntity;
    // mark older model as inactive.
    if (
      currentActiveAsset?.type === EntityType.Model &&
      currentActiveAsset?.id
    ) {
      this.databaseActionQueue.updatePriority(
        currentActiveAsset.id,
        DatabaseActionQueuePriority.InactiveModelProfile
      );
    }
    this.dataModelerStateService.dispatch("setActiveAsset", [
      entityType,
      entityId,
    ]);
  }

  @DataModelerActions.PersistentAction()
  public async deleteEntity(
    { stateService }: EntityStateActionArg<any>,
    entityType: EntityType,
    entityId: string
  ) {
    const applicationState = this.dataModelerStateService.getApplicationState();
    if (
      applicationState.activeEntity?.id === entityId &&
      applicationState.activeEntity?.type === entityType
    ) {
      const newEntityId = this.getNextEntityId(
        stateService.getCurrentState().entities,
        entityId
      );
      if (newEntityId) {
        await this.dataModelerService.dispatch("setActiveAsset", [
          entityType,
          newEntityId,
        ]);
      }
    }

    this.dataModelerStateService.dispatch("deleteEntity", [
      entityType,
      StateType.Persistent,
      entityId,
    ]);
    this.dataModelerStateService.dispatch("deleteEntity", [
      entityType,
      StateType.Derived,
      entityId,
    ]);
  }

  private getNextEntityId(
    entities: Array<EntityRecord>,
    entityId: string
  ): string {
    if (entities.length === 1) return undefined;
    const idx = entities.findIndex((entity) => entity.id === entityId);
    if (idx === 0) {
      return entities[idx + 1].id;
    } else {
      return entities[idx - 1].id;
    }
  }
}
