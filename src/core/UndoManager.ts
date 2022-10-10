import { reactive, ref, computed } from "vue";

let commands: any[] = reactive([]);

const index: any = ref(-1);

const limit: any = ref(undefined);

const isExecuting = ref(false);

let callback: () => void;

const hasUndo = computed(() => index.value !== -1);
const hasRedo = computed(() => index.value < commands.length - 1);

function removeFromTo(array: any[], from: number, to: number) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  array.splice(from, !to || 1 + to - from + (!((to < 0) ^ (from >= 0)) && (to < 0 || -1) * array.length));
  return array.length;
}

const execute = async (command: any[], action: any) => {
  if (!command || typeof command[action] !== "function") {
    return;
  }
  isExecuting.value = true;

  await command[action](index.value);

  isExecuting.value = false;
  return;
};

export default {
  /**
   *  Add a command to the queue.
   */
  add: (command: any) => {
    if (isExecuting.value) {
      return;
    }

    // if we are here after having called undo,
    // invalidate items higher on the stack
    commands.splice(index.value + 1, commands.length - index.value);

    commands.push(command);

    // if limit is set, remove items from the start
    if (limit.value && commands.length > limit.value) {
      removeFromTo(commands, 0, -(limit.value + 1));
    }

    // set the current index to the end
    index.value = commands.length - 1;
    if (callback) {
      callback();
    }
    return;
  },

  /**
   * Pass a function to be called on undo and redo actions.
   */
  setCallback: (callbackFunc: () => void) => {
    callback = callbackFunc;
  },

  /**
   * Perform undo: call the undo function at the current index and decrease the index by 1.
   */
  undo: async () => {
    const command = commands[index.value];
    if (!command) {
      return;
    }
    // Workspace.hideSelector();
    // Workspace.forceHideToolTip();

    await execute(command, "undo");
    index.value -= 1;
    if (callback) {
      await callback();
    }

    return;
  },

  /**
   * Perform redo: call the redo function at the next index and increase the index by 1.
   */
  redo: async () => {
    const command = commands[index.value + 1];
    if (!command) {
      return;
    }
    // Workspace.hideSelector();
    // Workspace.forceHideToolTip();
    await execute(command, "redo");
    index.value += 1;
    if (callback) {
      await callback();
    }

    return;
  },

  /**
   * Clears the memory, losing all stored states. Reset the index.
   */
  clear: () => {
    const prevSize = commands.length;

    commands = [];
    index.value = -1;

    if (callback && prevSize > 0) {
      callback();
    }
  },

  hasUndo,

  hasRedo,

  getCommands: () => {
    return commands;
  },

  getIndex: () => {
    return index;
  },

  setLimit: (l: any) => {
    limit.value = l;
  },
};
