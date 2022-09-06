import EventEmitter from 'eventemitter3';

export const EVENT = {
  TOGGLE_SIDEBAR: 'toggle_sidebar',
  SET_CURRENT_FILE: 'set_current_file',

  SHOW_PROJECT_CONFIG: 'show_project_config',
  SHOW_FILE_SCHEMA_CONFIG: 'show_file_schema_config',
  SHOW_FILE_PREVIEW: 'show_file_preview',
  SHOW_NAME_DIALOG: 'show_name_dialog',
  SHOW_TRANSLATION_MANAGER_DIALOG: 'show_translation_manager_dialog',
  SWITCH_LANG: 'switch_lang',
  FILTER_CHANGED: 'filter_changed',

  REFRESH_PROJECT_FILE_TREE: 'refresh_project_file_tree',
  UPDATE_TRANSLATION: 'update_translation',
  UPDATE_TERM_TRANSLATION: 'update_term_translation',
  SET_TRANSLATION: 'set_translation',
  SAVE_TRANSLATION: 'save_translation',
  NEW_FILE: 'new_file',
  SAVE_FILE: 'save_file',
  DELETE_FILE: 'delete_file',
  CLOSE_FILE: 'close_file',
  RENAME_FILE: 'rename_file',
  NEW_FOLDER: 'new_folder',
  CHECK_FILE_CHANGED: 'check_file_changed',
  FILE_SCHEMA_CHANGED: 'file_schema_changed',

  DATA_ITEM_CHANGED: 'data_item_changed',
  DATA_ITEM_ADD: 'data_item_add',
  DATA_ITEM_DELETE: 'data_item_delete',
  DATA_ITEM_DUPLICATED: 'data_item_duplicated',
  DATA_LIST_SET: 'data_list_set',
};

export const eventBus = new EventEmitter();
