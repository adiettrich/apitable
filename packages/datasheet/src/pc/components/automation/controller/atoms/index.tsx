import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { atomsWithQuery } from 'jotai-tanstack-query';
import {Api, ConfigConstant, IServerFormPack} from '@apitable/core';
import { fetchFormPack } from '@apitable/core/dist/modules/database/api/form_api';
import { INodeSchema, IRobotAction, IRobotContext, IRobotTrigger } from '../../../robot/interface';
import { loadableWithDefault } from '../../../robot/robot_detail/api';
import { getFormId } from '../hooks/use_robot_fields';

export enum PanelName {
  BasicInfo = 'basic_info',
  Trigger = 'trigger',
  Action = 'action',
}
const automationDrawerVisibleAtom = atomWithImmer<boolean>(false);
export const formListDstIdAtom = atomWithImmer<string>('');

const automationTriggerDatasheetAtom = atomWithImmer<{
  formId: string|undefined,
  id: string|undefined,
}>({
  formId: undefined,
  id: undefined
});

const automationStateAtom = atomWithImmer<IRobotContext | undefined>(undefined);

export interface ILocalAutomation {
  trigger: Map<string, IRobotTrigger>,
  action: Map<string, IRobotAction>,
}

const automationLocalMap = atomWithImmer<Map<string, IRobotTrigger | IRobotAction>>(
  new Map<string, IRobotTrigger | IRobotAction>()
);

const automationTriggerAtom = atom((get) => get(automationStateAtom)?.robot?.triggers?.[0]);
export const inheritedTriggerAtom = automationTriggerAtom;
export const formIdAtom = atom((get) => getFormId(get(automationTriggerAtom)));

export const automationActionsAtom = atomWithImmer<IRobotAction[]>([]);

const automationHistoryAtom = atomWithImmer<{
  dialogVisible: boolean;
  taskId?: string;
}>({
  dialogVisible: false,
});

const automationPanelAtom = atomWithImmer<{
  panelName?: PanelName;
  dataId?: string;
  data?: {
    nodeId: string;
    schema: INodeSchema;
    formData: any;
    mergedUiSchema: INodeSchema;
    title: string;
    description?: string;
    serviceLogo?: string;
  };
}>({
  panelName: PanelName.BasicInfo,
});

const [selectFormMeta] = atomsWithQuery((get) => ({
  queryKey: ['automation_fetchFormPack_formIdMeta', get(automationTriggerDatasheetAtom).formId],
  queryFn: async ({ queryKey: [, id] }) => {
    if(!id) {
      return {};
    }
    return await fetchFormPack(String(id!)).then(res => res?.data?.data ?? {
    });
  },
}));

const [formListAtom] = atomsWithQuery((get) => ({
  queryKey: ['automation_ConfigConstant.NodeType.FORM', get(formListDstIdAtom)],
  queryFn: async ({ queryKey: [, id] }) => {
    if(!id) {
      return [];
    }
    return await Api.getRelateNodeByDstId(String(id!), undefined, ConfigConstant.NodeType.FORM).then(res => res?.data?.data ?? []);
  },
}));

const [fetchFormMeta] = atomsWithQuery((get) => ({
  queryKey: ['automation_fetchFormPack_formId', get(formIdAtom)],
  queryFn: async ({ queryKey: [, id] }) => {
    if(!id) {
      return {};
    }
    return await fetchFormPack(String(id!)).then(res => res?.data?.data ?? {
    } as IServerFormPack);
  },
}));

export const loadableFormMeta = loadableWithDefault(fetchFormMeta, undefined);
export const loadableFormList = loadableWithDefault(formListAtom, []);

export const loadableFormItemAtom = loadableWithDefault(selectFormMeta, []);
export { automationLocalMap, automationStateAtom, automationDrawerVisibleAtom, automationHistoryAtom, automationPanelAtom, automationTriggerAtom, automationTriggerDatasheetAtom };
