<script lang="ts">
  import ModelIcon from "$lib/components/icons/Code.svelte";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  import TooltipContent from "$lib/components/tooltip/TooltipContent.svelte";
  import EditIcon from "$lib/components/icons/EditIcon.svelte";
  import WorkspaceHeaderStatusSpinner from "./WorkspaceHeaderStatusSpinner.svelte";

  export let onChangeCallback;
  export let titleInput;

  let titleInputElement;
  let editingTitle = false;
  let titleInputValue;
  let tooltipActive;

  function onKeydown(event) {
    if (editingTitle && event.key === "Enter") {
      titleInputElement.blur();
    }
  }

  $: inputSize =
    Math.max((editingTitle ? titleInputValue : titleInput)?.length || 0, 5) + 1;
</script>

<svelte:window on:keydown={onKeydown} />

<header
  style:height="var(--header-height)"
  class="grid items-center content-stretch justify-between bg-gray-100 pl-6 pr-6"
  style:grid-template-columns="[title] auto [controls] auto"
>
  <div>
    {#if titleInput !== undefined && titleInput !== null}
      <h1
        style:font-size="16px"
        class="grid grid-flow-col justify-start items-center gap-x-1"
      >
        <ModelIcon />
        <Tooltip
          distance={8}
          bind:active={tooltipActive}
          suppress={editingTitle}
        >
          <input
            id="model-title-input"
            bind:this={titleInputElement}
            on:input={(evt) => {
              titleInputValue = evt.target.value;
              editingTitle = true;
            }}
            class="bg-gray-100 border border-transparent border-2 hover:border-gray-400 rounded pl-2 pr-2 cursor-pointer"
            class:font-bold={editingTitle === false}
            on:blur={() => {
              editingTitle = false;
            }}
            value={titleInput}
            size={inputSize}
            on:change={onChangeCallback}
          />
          <TooltipContent slot="tooltip-content">
            <div class="flex items-center"><EditIcon size=".75em" />Edit</div>
          </TooltipContent>
        </Tooltip>
      </h1>
    {/if}
  </div>
  <WorkspaceHeaderStatusSpinner />
</header>
