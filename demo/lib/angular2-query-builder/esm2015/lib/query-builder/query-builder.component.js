import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { QueryOperatorDirective } from './query-operator.directive';
import { QueryFieldDirective } from './query-field.directive';
import { QueryEntityDirective } from './query-entity.directive';
import { QuerySwitchGroupDirective } from './query-switch-group.directive';
import { QueryButtonGroupDirective } from './query-button-group.directive';
import { QueryInputDirective } from './query-input.directive';
import { QueryRemoveButtonDirective } from './query-remove-button.directive';
import { QueryEmptyWarningDirective } from './query-empty-warning.directive';
import { QueryArrowIconDirective } from './query-arrow-icon.directive';
import { ChangeDetectorRef, Component, ContentChild, ContentChildren, forwardRef, Input, QueryList, ViewChild, ElementRef } from '@angular/core';
export const CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => QueryBuilderComponent),
    multi: true
};
export const VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => QueryBuilderComponent),
    multi: true
};
export class QueryBuilderComponent {
    constructor(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
        this.defaultClassNames = {
            arrowIconButton: 'q-arrow-icon-button',
            arrowIcon: 'q-icon q-arrow-icon',
            removeIcon: 'q-icon q-remove-icon',
            addIcon: 'q-icon q-add-icon',
            button: 'q-button',
            buttonGroup: 'q-button-group',
            removeButton: 'q-remove-button',
            switchGroup: 'q-switch-group',
            switchLabel: 'q-switch-label',
            switchRadio: 'q-switch-radio',
            rightAlign: 'q-right-align',
            transition: 'q-transition',
            collapsed: 'q-collapsed',
            treeContainer: 'q-tree-container',
            tree: 'q-tree',
            row: 'q-row',
            connector: 'q-connector',
            rule: 'q-rule',
            ruleSet: 'q-ruleset',
            invalidRuleSet: 'q-invalid-ruleset',
            emptyWarning: 'q-empty-warning',
            fieldControl: 'q-field-control',
            fieldControlSize: 'q-control-size',
            entityControl: 'q-entity-control',
            entityControlSize: 'q-control-size',
            operatorControl: 'q-operator-control',
            operatorControlSize: 'q-control-size',
            inputControl: 'q-input-control',
            inputControlSize: 'q-control-size'
        };
        this.defaultOperatorMap = {
            string: ['=', '!=', 'contains', 'like'],
            number: ['=', '!=', '>', '>=', '<', '<='],
            time: ['=', '!=', '>', '>=', '<', '<='],
            date: ['=', '!=', '>', '>=', '<', '<='],
            category: ['=', '!=', 'in', 'not in'],
            boolean: ['=']
        };
        this.data = { condition: 'and', rules: [] };
        this.allowRuleset = true;
        this.allowCollapse = false;
        this.emptyMessage = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
        this.config = { fields: {} };
        this.persistValueOnFieldChange = false;
        this.defaultTemplateTypes = [
            'string', 'number', 'time', 'date', 'category', 'boolean', 'multiselect'
        ];
        this.defaultPersistValueTypes = [
            'string', 'number', 'time', 'date', 'boolean'
        ];
        this.defaultEmptyList = [];
        this.inputContextCache = new Map();
        this.operatorContextCache = new Map();
        this.fieldContextCache = new Map();
        this.entityContextCache = new Map();
        this.removeButtonContextCache = new Map();
        // ----------END----------
        this.getDisabledState = () => {
            return this.disabled;
        };
    }
    // ----------OnInit Implementation----------
    ngOnInit() { }
    // ----------OnChanges Implementation----------
    ngOnChanges(changes) {
        const config = this.config;
        const type = typeof config;
        if (type === 'object') {
            this.fields = Object.keys(config.fields).map((value) => {
                const field = config.fields[value];
                field.value = field.value || value;
                return field;
            });
            if (config.entities) {
                this.entities = Object.keys(config.entities).map((value) => {
                    const entity = config.entities[value];
                    entity.value = entity.value || value;
                    return entity;
                });
            }
            else {
                this.entities = null;
            }
            this.operatorsCache = {};
        }
        else {
            throw new Error(`Expected 'config' must be a valid object, got ${type} instead.`);
        }
    }
    // ----------Validator Implementation----------
    validate(control) {
        const errors = {};
        const ruleErrorStore = [];
        let hasErrors = false;
        if (!this.config.allowEmptyRulesets && this.checkEmptyRuleInRuleset(this.data)) {
            errors.empty = 'Empty rulesets are not allowed.';
            hasErrors = true;
        }
        this.validateRulesInRuleset(this.data, ruleErrorStore);
        if (ruleErrorStore.length) {
            errors.rules = ruleErrorStore;
            hasErrors = true;
        }
        return hasErrors ? errors : null;
    }
    // ----------ControlValueAccessor Implementation----------
    get value() {
        return this.data;
    }
    set value(value) {
        // When component is initialized without a formControl, null is passed to value
        this.data = value || { condition: 'and', rules: [] };
        this.handleDataChange();
    }
    writeValue(obj) {
        this.value = obj;
    }
    registerOnChange(fn) {
        this.onChangeCallback = () => fn(this.data);
    }
    registerOnTouched(fn) {
        this.onTouchedCallback = () => fn(this.data);
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        this.changeDetectorRef.detectChanges();
    }
    findTemplateForRule(rule) {
        const type = this.getInputType(rule.field, rule.operator);
        if (type) {
            const queryInput = this.findQueryInput(type);
            if (queryInput) {
                return queryInput.template;
            }
            else {
                if (this.defaultTemplateTypes.indexOf(type) === -1) {
                    console.warn(`Could not find template for field with type: ${type}`);
                }
                return null;
            }
        }
    }
    findQueryInput(type) {
        const templates = this.parentInputTemplates || this.inputTemplates;
        return templates.find((item) => item.queryInputType === type);
    }
    getOperators(field) {
        if (this.operatorsCache[field]) {
            return this.operatorsCache[field];
        }
        let operators = this.defaultEmptyList;
        const fieldObject = this.config.fields[field];
        if (this.config.getOperators) {
            return this.config.getOperators(field, fieldObject);
        }
        const type = fieldObject.type;
        if (fieldObject && fieldObject.operators) {
            operators = fieldObject.operators;
        }
        else if (type) {
            operators = (this.operatorMap && this.operatorMap[type]) || this.defaultOperatorMap[type] || this.defaultEmptyList;
            if (operators.length === 0) {
                console.warn(`No operators found for field '${field}' with type ${fieldObject.type}. ` +
                    `Please define an 'operators' property on the field or use the 'operatorMap' binding to fix this.`);
            }
            if (fieldObject.nullable) {
                operators = operators.concat(['is null', 'is not null']);
            }
        }
        else {
            console.warn(`No 'type' property found on field: '${field}'`);
        }
        // Cache reference to array object, so it won't be computed next time and trigger a rerender.
        this.operatorsCache[field] = operators;
        return operators;
    }
    getFields(entity) {
        if (this.entities && entity) {
            return this.fields.filter((field) => {
                return field && field.entity === entity;
            });
        }
        else {
            return this.fields;
        }
    }
    getInputType(field, operator) {
        if (this.config.getInputType) {
            return this.config.getInputType(field, operator);
        }
        if (!this.config.fields[field]) {
            throw new Error(`No configuration for field '${field}' could be found! Please add it to config.fields.`);
        }
        const type = this.config.fields[field].type;
        switch (operator) {
            case 'is null':
            case 'is not null':
                return null; // No displayed component
            case 'in':
            case 'not in':
                return type === 'category' || type === 'boolean' ? 'multiselect' : type;
            default:
                return type;
        }
    }
    getOptions(field) {
        if (this.config.getOptions) {
            return this.config.getOptions(field);
        }
        return this.config.fields[field].options || this.defaultEmptyList;
    }
    getClassNames(...args) {
        const clsLookup = this.classNames ? this.classNames : this.defaultClassNames;
        const classNames = args.map((id) => clsLookup[id] || this.defaultClassNames[id]).filter((c) => !!c);
        return classNames.length ? classNames.join(' ') : null;
    }
    getDefaultField(entity) {
        if (!entity) {
            return null;
        }
        else if (entity.defaultField !== undefined) {
            return this.getDefaultValue(entity.defaultField);
        }
        else {
            const entityFields = this.fields.filter((field) => {
                return field && field.entity === entity.value;
            });
            if (entityFields && entityFields.length) {
                return entityFields[0];
            }
            else {
                console.warn(`No fields found for entity '${entity.name}'. ` +
                    `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
                return null;
            }
        }
    }
    getDefaultOperator(field) {
        if (field && field.defaultOperator !== undefined) {
            return this.getDefaultValue(field.defaultOperator);
        }
        else {
            const operators = this.getOperators(field.value);
            if (operators && operators.length) {
                return operators[0];
            }
            else {
                console.warn(`No operators found for field '${field.value}'. ` +
                    `A 'defaultOperator' is also not specified on the field config. Operator value will default to null.`);
                return null;
            }
        }
    }
    addRule(parent) {
        if (this.disabled) {
            return;
        }
        parent = parent || this.data;
        if (this.config.addRule) {
            this.config.addRule(parent);
        }
        else {
            const field = this.fields[0];
            parent.rules = parent.rules.concat([{
                    field: field.value,
                    operator: this.getDefaultOperator(field),
                    value: this.getDefaultValue(field.defaultValue),
                    entity: field.entity
                }]);
        }
        this.handleTouched();
        this.handleDataChange();
    }
    removeRule(rule, parent) {
        if (this.disabled) {
            return;
        }
        parent = parent || this.data;
        if (this.config.removeRule) {
            this.config.removeRule(rule, parent);
        }
        else {
            parent.rules = parent.rules.filter((r) => r !== rule);
        }
        this.inputContextCache.delete(rule);
        this.operatorContextCache.delete(rule);
        this.fieldContextCache.delete(rule);
        this.entityContextCache.delete(rule);
        this.removeButtonContextCache.delete(rule);
        this.handleTouched();
        this.handleDataChange();
    }
    addRuleSet(parent) {
        if (this.disabled) {
            return;
        }
        parent = parent || this.data;
        if (this.config.addRuleSet) {
            this.config.addRuleSet(parent);
        }
        else {
            parent.rules = parent.rules.concat([{ condition: 'and', rules: [] }]);
        }
        this.handleTouched();
        this.handleDataChange();
    }
    removeRuleSet(ruleset, parent) {
        if (this.disabled) {
            return;
        }
        ruleset = ruleset || this.data;
        parent = parent || this.parentValue;
        if (this.config.removeRuleSet) {
            this.config.removeRuleSet(ruleset, parent);
        }
        else {
            parent.rules = parent.rules.filter((r) => r !== ruleset);
        }
        this.handleTouched();
        this.handleDataChange();
    }
    transitionEnd(e) {
        this.treeContainer.nativeElement.style.maxHeight = null;
    }
    toggleCollapse() {
        this.computedTreeContainerHeight();
        setTimeout(() => {
            this.data.collapsed = !this.data.collapsed;
        }, 100);
    }
    computedTreeContainerHeight() {
        const nativeElement = this.treeContainer.nativeElement;
        if (nativeElement && nativeElement.firstElementChild) {
            nativeElement.style.maxHeight = (nativeElement.firstElementChild.clientHeight + 8) + 'px';
        }
    }
    changeCondition(value) {
        if (this.disabled) {
            return;
        }
        this.data.condition = value;
        this.handleTouched();
        this.handleDataChange();
    }
    changeOperator(rule) {
        if (this.disabled) {
            return;
        }
        if (this.config.coerceValueForOperator) {
            rule.value = this.config.coerceValueForOperator(rule.operator, rule.value, rule);
        }
        else {
            rule.value = this.coerceValueForOperator(rule.operator, rule.value, rule);
        }
        this.handleTouched();
        this.handleDataChange();
    }
    coerceValueForOperator(operator, value, rule) {
        const inputType = this.getInputType(rule.field, operator);
        if (inputType === 'multiselect' && !Array.isArray(value)) {
            return [value];
        }
        return value;
    }
    changeInput() {
        if (this.disabled) {
            return;
        }
        this.handleTouched();
        this.handleDataChange();
    }
    changeField(fieldValue, rule) {
        if (this.disabled) {
            return;
        }
        const inputContext = this.inputContextCache.get(rule);
        const currentField = inputContext && inputContext.field;
        const nextField = this.config.fields[fieldValue];
        const nextValue = this.calculateFieldChangeValue(currentField, nextField, rule.value);
        if (nextValue !== undefined) {
            rule.value = nextValue;
        }
        else {
            delete rule.value;
        }
        rule.operator = this.getDefaultOperator(nextField);
        // Create new context objects so templates will automatically update
        this.inputContextCache.delete(rule);
        this.operatorContextCache.delete(rule);
        this.fieldContextCache.delete(rule);
        this.entityContextCache.delete(rule);
        this.getInputContext(rule);
        this.getFieldContext(rule);
        this.getOperatorContext(rule);
        this.getEntityContext(rule);
        this.handleTouched();
        this.handleDataChange();
    }
    changeEntity(entityValue, rule, index, data) {
        if (this.disabled) {
            return;
        }
        let i = index;
        let rs = data;
        const entity = this.entities.find((e) => e.value === entityValue);
        const defaultField = this.getDefaultField(entity);
        if (!rs) {
            rs = this.data;
            i = rs.rules.findIndex((x) => x === rule);
        }
        rule.field = defaultField.value;
        rs.rules[i] = rule;
        if (defaultField) {
            this.changeField(defaultField.value, rule);
        }
        else {
            this.handleTouched();
            this.handleDataChange();
        }
    }
    getDefaultValue(defaultValue) {
        switch (typeof defaultValue) {
            case 'function':
                return defaultValue();
            default:
                return defaultValue;
        }
    }
    getOperatorTemplate() {
        const t = this.parentOperatorTemplate || this.operatorTemplate;
        return t ? t.template : null;
    }
    getFieldTemplate() {
        const t = this.parentFieldTemplate || this.fieldTemplate;
        return t ? t.template : null;
    }
    getEntityTemplate() {
        const t = this.parentEntityTemplate || this.entityTemplate;
        return t ? t.template : null;
    }
    getArrowIconTemplate() {
        const t = this.parentArrowIconTemplate || this.arrowIconTemplate;
        return t ? t.template : null;
    }
    getButtonGroupTemplate() {
        const t = this.parentButtonGroupTemplate || this.buttonGroupTemplate;
        return t ? t.template : null;
    }
    getSwitchGroupTemplate() {
        const t = this.parentSwitchGroupTemplate || this.switchGroupTemplate;
        return t ? t.template : null;
    }
    getRemoveButtonTemplate() {
        const t = this.parentRemoveButtonTemplate || this.removeButtonTemplate;
        return t ? t.template : null;
    }
    getEmptyWarningTemplate() {
        const t = this.parentEmptyWarningTemplate || this.emptyWarningTemplate;
        return t ? t.template : null;
    }
    getQueryItemClassName(local) {
        let cls = this.getClassNames('row', 'connector', 'transition');
        cls += ' ' + this.getClassNames(local.ruleset ? 'ruleSet' : 'rule');
        if (local.invalid) {
            cls += ' ' + this.getClassNames('invalidRuleSet');
        }
        return cls;
    }
    getButtonGroupContext() {
        if (!this.buttonGroupContext) {
            this.buttonGroupContext = {
                addRule: this.addRule.bind(this),
                addRuleSet: this.allowRuleset && this.addRuleSet.bind(this),
                removeRuleSet: this.allowRuleset && this.parentValue && this.removeRuleSet.bind(this),
                getDisabledState: this.getDisabledState,
                $implicit: this.data
            };
        }
        return this.buttonGroupContext;
    }
    getRemoveButtonContext(rule) {
        if (!this.removeButtonContextCache.has(rule)) {
            this.removeButtonContextCache.set(rule, {
                removeRule: this.removeRule.bind(this),
                getDisabledState: this.getDisabledState,
                $implicit: rule
            });
        }
        return this.removeButtonContextCache.get(rule);
    }
    getFieldContext(rule) {
        if (!this.fieldContextCache.has(rule)) {
            this.fieldContextCache.set(rule, {
                onChange: this.changeField.bind(this),
                getFields: this.getFields.bind(this),
                getDisabledState: this.getDisabledState,
                fields: this.fields,
                $implicit: rule
            });
        }
        return this.fieldContextCache.get(rule);
    }
    getEntityContext(rule) {
        if (!this.entityContextCache.has(rule)) {
            this.entityContextCache.set(rule, {
                onChange: this.changeEntity.bind(this),
                getDisabledState: this.getDisabledState,
                entities: this.entities,
                $implicit: rule
            });
        }
        return this.entityContextCache.get(rule);
    }
    getSwitchGroupContext() {
        return {
            onChange: this.changeCondition.bind(this),
            getDisabledState: this.getDisabledState,
            $implicit: this.data
        };
    }
    getArrowIconContext() {
        return {
            getDisabledState: this.getDisabledState,
            $implicit: this.data
        };
    }
    getEmptyWarningContext() {
        return {
            getDisabledState: this.getDisabledState,
            message: this.emptyMessage,
            $implicit: this.data
        };
    }
    getOperatorContext(rule) {
        if (!this.operatorContextCache.has(rule)) {
            this.operatorContextCache.set(rule, {
                onChange: this.changeOperator.bind(this),
                getDisabledState: this.getDisabledState,
                operators: this.getOperators(rule.field),
                $implicit: rule
            });
        }
        return this.operatorContextCache.get(rule);
    }
    getInputContext(rule) {
        if (!this.inputContextCache.has(rule)) {
            this.inputContextCache.set(rule, {
                onChange: this.changeInput.bind(this),
                getDisabledState: this.getDisabledState,
                options: this.getOptions(rule.field),
                field: this.config.fields[rule.field],
                $implicit: rule
            });
        }
        return this.inputContextCache.get(rule);
    }
    calculateFieldChangeValue(currentField, nextField, currentValue) {
        if (this.config.calculateFieldChangeValue != null) {
            return this.config.calculateFieldChangeValue(currentField, nextField, currentValue);
        }
        const canKeepValue = () => {
            if (currentField == null || nextField == null) {
                return false;
            }
            return currentField.type === nextField.type
                && this.defaultPersistValueTypes.indexOf(currentField.type) !== -1;
        };
        if (this.persistValueOnFieldChange && canKeepValue()) {
            return currentValue;
        }
        if (nextField && nextField.defaultValue !== undefined) {
            return this.getDefaultValue(nextField.defaultValue);
        }
        return undefined;
    }
    checkEmptyRuleInRuleset(ruleset) {
        if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
            return true;
        }
        else {
            return ruleset.rules.some((item) => {
                if (item.rules) {
                    return this.checkEmptyRuleInRuleset(item);
                }
                else {
                    return false;
                }
            });
        }
    }
    validateRulesInRuleset(ruleset, errorStore) {
        if (ruleset && ruleset.rules && ruleset.rules.length > 0) {
            ruleset.rules.forEach((item) => {
                if (item.rules) {
                    return this.validateRulesInRuleset(item, errorStore);
                }
                else if (item.field) {
                    const field = this.config.fields[item.field];
                    if (field && field.validator && field.validator.apply) {
                        const error = field.validator(item, ruleset);
                        if (error != null) {
                            errorStore.push(error);
                        }
                    }
                }
            });
        }
    }
    handleDataChange() {
        this.changeDetectorRef.markForCheck();
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
        if (this.parentChangeCallback) {
            this.parentChangeCallback();
        }
    }
    handleTouched() {
        if (this.onTouchedCallback) {
            this.onTouchedCallback();
        }
        if (this.parentTouchedCallback) {
            this.parentTouchedCallback();
        }
    }
}
QueryBuilderComponent.decorators = [
    { type: Component, args: [{
                selector: 'query-builder',
                template: "<div [ngClass]=\"getClassNames('switchRow')\">\n  <ng-template #defaultArrowIcon>\n    <i [ngClass]=\"getClassNames('arrowIcon')\"></i>\n  </ng-template>\n\n  <a *ngIf=\"allowCollapse\" (click)=\"toggleCollapse()\" [ngClass]=\"getClassNames('arrowIconButton', data.collapsed ? 'collapsed' : null)\">\n    <ng-container *ngIf=\"getArrowIconTemplate() as template; else defaultArrowIcon\">\n      <ng-container *ngTemplateOutlet=\"template; context: getArrowIconContext()\"></ng-container>\n    </ng-container>\n  </a>\n\n  <ng-container *ngIf=\"getButtonGroupTemplate() as template; else defaultButtonGroup\">\n    <div [ngClass]=\"getClassNames('buttonGroup', 'rightAlign')\">\n      <ng-container *ngTemplateOutlet=\"template; context: getButtonGroupContext()\"></ng-container>\n    </div>\n  </ng-container>\n\n  <ng-template #defaultButtonGroup>\n    <div [ngClass]=\"getClassNames('buttonGroup', 'rightAlign')\">\n      <button type=\"button\" (click)=\"addRule()\" [ngClass]=\"getClassNames('button')\" [disabled]=disabled>\n        <i [ngClass]=\"getClassNames('addIcon')\"></i> Rule\n      </button>\n      <button type=\"button\" (click)=\"addRuleSet()\" [ngClass]=\"getClassNames('button')\" *ngIf=\"allowRuleset\" [disabled]=disabled>\n        <i [ngClass]=\"getClassNames('addIcon')\"></i> Ruleset\n      </button>\n      <ng-container *ngIf=\"!!parentValue && allowRuleset\">\n        <button type=\"button\" (click)=\"removeRuleSet()\" [ngClass]=\"getClassNames('button', 'removeButton')\" [disabled]=disabled>\n          <i [ngClass]=\"getClassNames('removeIcon')\"></i>\n        </button>\n      </ng-container>\n    </div>\n  </ng-template>\n\n  <ng-container *ngIf=\"getSwitchGroupTemplate() as template; else defaultSwitchGroup\">\n    <ng-container *ngTemplateOutlet=\"template; context: getSwitchGroupContext()\"></ng-container>\n  </ng-container>\n\n  <ng-template #defaultSwitchGroup>\n    <div [ngClass]=\"getClassNames('switchGroup', 'transition')\" *ngIf=\"data\">\n      <div [ngClass]=\"getClassNames('switchControl')\">\n        <input type=\"radio\" [ngClass]=\"getClassNames('switchRadio')\" [(ngModel)]=\"data.condition\" [disabled]=disabled\n          value=\"and\" #andOption />\n        <label (click)=\"changeCondition(andOption.value)\" [ngClass]=\"getClassNames('switchLabel')\">AND</label>\n      </div>\n      <div [ngClass]=\"getClassNames('switchControl')\">\n        <input type=\"radio\" [ngClass]=\"getClassNames('switchRadio')\" [(ngModel)]=\"data.condition\" [disabled]=disabled\n          value=\"or\" #orOption />\n        <label (click)=\"changeCondition(orOption.value)\" [ngClass]=\"getClassNames('switchLabel')\">OR</label>\n      </div>\n    </div>\n  </ng-template>\n</div>\n\n<div #treeContainer (transitionend)=\"transitionEnd($event)\" [ngClass]=\"getClassNames('treeContainer', data.collapsed ? 'collapsed' : null)\">\n  <ul [ngClass]=\"getClassNames('tree')\" *ngIf=\"data && data.rules\">\n    <ng-container *ngFor=\"let rule of data.rules;let i=index\">\n\n      <ng-container *ngIf=\"{ruleset: !!rule.rules, invalid: !config.allowEmptyRulesets && rule.rules && rule.rules.length === 0} as local\">\n        <li [ngClass]=\"getQueryItemClassName(local)\">\n          <ng-container *ngIf=\"!local.ruleset\">\n\n            <ng-container *ngIf=\"getRemoveButtonTemplate() as template; else defaultRemoveButton\">\n              <div [ngClass]=\"getClassNames('buttonGroup', 'rightAlign')\">\n                <ng-container *ngTemplateOutlet=\"template; context: getRemoveButtonContext(rule)\"></ng-container>\n              </div>\n            </ng-container>\n\n            <ng-template #defaultRemoveButton>\n              <div [ngClass]=\"getClassNames('removeButtonSize', 'rightAlign')\">\n                <button type=\"button\" [ngClass]=\"getClassNames('button', 'removeButton')\" (click)=\"removeRule(rule, data)\" [disabled]=disabled>\n                  <i [ngClass]=\"getClassNames('removeIcon')\"></i>\n                </button>\n              </div>\n            </ng-template>\n\n            <div *ngIf=\"entities?.length > 0\" class=\"q-inline-block-display\">\n              <ng-container *ngIf=\"getEntityTemplate() as template; else defaultEntity\">\n                <ng-container *ngTemplateOutlet=\"template; context: getEntityContext(rule)\"></ng-container>\n              </ng-container>\n            </div>\n\n            <ng-template #defaultEntity>\n              <div [ngClass]=\"getClassNames('entityControlSize')\">\n                <select [ngClass]=\"getClassNames('entityControl')\" [(ngModel)]=\"rule.entity\" (ngModelChange)=\"changeEntity($event, rule,i,data)\"\n                  [disabled]=\"disabled\">\n                  <option *ngFor=\"let entity of entities\" [ngValue]=\"entity.value\">\n                    {{entity.name}}\n                  </option>\n                </select>\n              </div>\n            </ng-template>\n\n            <ng-container *ngIf=\"getFieldTemplate() as template; else defaultField\">\n              <ng-container *ngTemplateOutlet=\"template; context: getFieldContext(rule)\"></ng-container>\n            </ng-container>\n\n            <ng-template #defaultField>\n              <div [ngClass]=\"getClassNames('fieldControlSize')\">\n                <select [ngClass]=\"getClassNames('fieldControl')\" [(ngModel)]=\"rule.field\" (ngModelChange)=\"changeField($event, rule)\"\n                  [disabled]=\"disabled\">\n                  <option *ngFor=\"let field of getFields(rule.entity)\" [ngValue]=\"field.value\">\n                    {{field.name}}\n                  </option>\n                </select>\n              </div>\n            </ng-template>\n\n            <ng-container *ngIf=\"getOperatorTemplate() as template; else defaultOperator\">\n              <ng-container *ngTemplateOutlet=\"template; context: getOperatorContext(rule)\"></ng-container>\n            </ng-container>\n\n            <ng-template #defaultOperator>\n              <div [ngClass]=\"getClassNames('operatorControlSize')\">\n                <select [ngClass]=\"getClassNames('operatorControl')\" [(ngModel)]=\"rule.operator\" (ngModelChange)=\"changeOperator(rule)\"\n                  [disabled]=\"disabled\">\n                  <option *ngFor=\"let operator of getOperators(rule.field)\" [ngValue]=\"operator\">\n                    {{operator}}\n                  </option>\n                </select>\n              </div>\n            </ng-template>\n\n            <ng-container *ngIf=\"findTemplateForRule(rule) as template; else defaultInput\">\n              <ng-container *ngTemplateOutlet=\"template; context: getInputContext(rule)\"></ng-container>\n            </ng-container>\n\n            <ng-template #defaultInput>\n              <div [ngClass]=\"getClassNames('inputControlSize')\" [ngSwitch]=\"getInputType(rule.field, rule.operator)\">\n                <input [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'string'\" type=\"text\">\n                <input [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'number'\" type=\"number\">\n                <input [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'date'\" type=\"date\">\n                <input [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'time'\" type=\"time\">\n                <select [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'category'\">\n                  <option *ngFor=\"let opt of getOptions(rule.field)\" [ngValue]=\"opt.value\">\n                    {{opt.name}}\n                  </option>\n                </select>\n                <ng-container *ngSwitchCase=\"'multiselect'\">\n                  <select [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                    [disabled]=\"disabled\" multiple>\n                    <option *ngFor=\"let opt of getOptions(rule.field)\" [ngValue]=\"opt.value\">\n                      {{opt.name}}\n                    </option>\n                  </select>\n                </ng-container>\n                <input [ngClass]=\"getClassNames('inputControl')\" [(ngModel)]=\"rule.value\" (ngModelChange)=\"changeInput()\"\n                  [disabled]=\"disabled\" *ngSwitchCase=\"'boolean'\" type=\"checkbox\">\n              </div>\n            </ng-template>\n\n          </ng-container>\n          <query-builder *ngIf=\"local.ruleset\" [data]=\"rule\" [disabled]=\"disabled\" [parentTouchedCallback]=\"parentTouchedCallback || onTouchedCallback\"\n            [parentChangeCallback]=\"parentChangeCallback || onChangeCallback\" [parentInputTemplates]=\"parentInputTemplates || inputTemplates\"\n            [parentOperatorTemplate]=\"parentOperatorTemplate || operatorTemplate\" [parentFieldTemplate]=\"parentFieldTemplate || fieldTemplate\"\n            [parentEntityTemplate]=\"parentEntityTemplate || entityTemplate\" [parentSwitchGroupTemplate]=\"parentSwitchGroupTemplate || switchGroupTemplate\"\n            [parentButtonGroupTemplate]=\"parentButtonGroupTemplate || buttonGroupTemplate\" [parentRemoveButtonTemplate]=\"parentRemoveButtonTemplate || removeButtonTemplate\"\n            [parentEmptyWarningTemplate]=\"parentEmptyWarningTemplate || emptyWarningTemplate\" [parentArrowIconTemplate]=\"parentArrowIconTemplate || arrowIconTemplate\"\n            [parentValue]=\"data\" [classNames]=\"classNames\" [config]=\"config\" [allowRuleset]=\"allowRuleset\"\n            [allowCollapse]=\"allowCollapse\" [emptyMessage]=\"emptyMessage\" [operatorMap]=\"operatorMap\">\n          </query-builder>\n\n          <ng-container *ngIf=\"getEmptyWarningTemplate() as template; else defaultEmptyWarning\">\n            <ng-container *ngIf=\"local.invalid\">\n              <ng-container *ngTemplateOutlet=\"template; context: getEmptyWarningContext()\"></ng-container>\n            </ng-container>\n          </ng-container>\n\n          <ng-template #defaultEmptyWarning>\n            <p [ngClass]=\"getClassNames('emptyWarning')\" *ngIf=\"local.invalid\">\n              {{emptyMessage}}\n            </p>\n          </ng-template>\n        </li>\n      </ng-container>\n    </ng-container>\n  </ul>\n</div>",
                providers: [CONTROL_VALUE_ACCESSOR, VALIDATOR],
                styles: ["@charset \"UTF-8\";:host{display:block;width:100%}:host .q-icon{font-size:12px;font-style:normal}:host .q-remove-icon:before{content:\"\u274C\"}:host .q-arrow-icon-button{cursor:pointer;float:left;margin:4px 6px 4px 0;transform:rotate(90deg);transition:transform .25s linear}:host .q-arrow-icon-button.q-collapsed{transform:rotate(0)}:host .q-arrow-icon:before{content:\"\u25B6\"}:host .q-add-icon{color:#555}:host .q-add-icon:before{content:\"\u2795\"}:host .q-remove-button{color:#b3415d;width:31px}:host .q-button-group,:host .q-switch-group{font-family:Lucida Grande,Tahoma,Verdana,sans-serif;overflow:hidden}:host .q-right-align{float:right}:host .q-button{background-color:#fff;margin-left:8px;padding:0 8px}:host .q-button:disabled{display:none}:host .q-control-size{display:inline-block;padding-right:10px;vertical-align:top}:host .q-entity-control,:host .q-field-control,:host .q-input-control,:host .q-operator-control{background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;color:#555;display:inline-block;padding:5px 8px;width:auto}:host .q-entity-control:disabled,:host .q-field-control:disabled,:host .q-input-control:disabled,:host .q-operator-control:disabled{border-color:transparent}:host .q-entity-control,:host .q-field-control,:host .q-input-control:not([type=checkbox]),:host .q-operator-control{-webkit-appearance:none;min-height:32px}:host .q-button,:host .q-switch-label{border:1px solid rgba(0,0,0,.2);box-sizing:border-box;float:left;font-size:14px;font-weight:400;line-height:30px;margin-bottom:0;text-align:center;text-shadow:none}:host .q-button:hover,:host .q-switch-label:hover{background-color:#f0f0f0;cursor:pointer}:host .q-switch-label{background-color:#e4e4e4;padding:0 8px}:host .q-switch-radio{border:0;clip:rect(0,0,0,0);height:1px;overflow:hidden;position:absolute;width:1px}:host .q-switch-radio:checked+.q-switch-label{background:#fff;border:1px solid #619ed7;color:#3176b3}:host .q-switch-radio:disabled+.q-switch-label{display:none}:host .q-switch-radio:checked:disabled+.q-switch-label{border-color:transparent;color:initial;cursor:default;display:initial}:host .q-invalid-ruleset{background:rgba(179,65,93,.1)!important;border:1px solid rgba(179,65,93,.5)!important}:host .q-empty-warning{color:#8d252e;text-align:center}:host .q-rule,:host .q-ruleset{border:1px solid #ccc}:host .q-rule{background:#fff}:host .q-transition{transition:all .1s ease-in-out}:host .q-tree-container{overflow:hidden;transition:max-height .25s ease-in;width:100%}:host .q-tree-container.q-collapsed{max-height:0!important}:host .q-tree{list-style:none;margin:4px 0 2px}:host .q-row{margin-top:6px;padding:6px 8px}:host .q-connector{position:relative}:host .q-connector:before{border-width:0 0 2px 2px;top:-5px}:host .q-connector:after{border-width:0 0 0 2px;top:50%}:host .q-connector:after,:host .q-connector:before{border-color:#ccc;border-style:solid;content:\"\";height:calc(50% + 6px);left:-12px;position:absolute;width:9px}:host .q-connector:last-child:after{content:none}:host .q-inline-block-display{display:inline-block;vertical-align:top}"]
            },] }
];
QueryBuilderComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
QueryBuilderComponent.propDecorators = {
    disabled: [{ type: Input }],
    data: [{ type: Input }],
    allowRuleset: [{ type: Input }],
    allowCollapse: [{ type: Input }],
    emptyMessage: [{ type: Input }],
    classNames: [{ type: Input }],
    operatorMap: [{ type: Input }],
    parentValue: [{ type: Input }],
    config: [{ type: Input }],
    parentArrowIconTemplate: [{ type: Input }],
    parentInputTemplates: [{ type: Input }],
    parentOperatorTemplate: [{ type: Input }],
    parentFieldTemplate: [{ type: Input }],
    parentEntityTemplate: [{ type: Input }],
    parentSwitchGroupTemplate: [{ type: Input }],
    parentButtonGroupTemplate: [{ type: Input }],
    parentRemoveButtonTemplate: [{ type: Input }],
    parentEmptyWarningTemplate: [{ type: Input }],
    parentChangeCallback: [{ type: Input }],
    parentTouchedCallback: [{ type: Input }],
    persistValueOnFieldChange: [{ type: Input }],
    treeContainer: [{ type: ViewChild, args: ['treeContainer', { static: true },] }],
    buttonGroupTemplate: [{ type: ContentChild, args: [QueryButtonGroupDirective,] }],
    switchGroupTemplate: [{ type: ContentChild, args: [QuerySwitchGroupDirective,] }],
    fieldTemplate: [{ type: ContentChild, args: [QueryFieldDirective,] }],
    entityTemplate: [{ type: ContentChild, args: [QueryEntityDirective,] }],
    operatorTemplate: [{ type: ContentChild, args: [QueryOperatorDirective,] }],
    removeButtonTemplate: [{ type: ContentChild, args: [QueryRemoveButtonDirective,] }],
    emptyWarningTemplate: [{ type: ContentChild, args: [QueryEmptyWarningDirective,] }],
    inputTemplates: [{ type: ContentChildren, args: [QueryInputDirective,] }],
    arrowIconTemplate: [{ type: ContentChild, args: [QueryArrowIconDirective,] }],
    value: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktYnVpbGRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL25lb3Npcy9wcm9qZWN0cy9Bbmd1bGFyLVF1ZXJ5QnVpbGRlci9wcm9qZWN0cy9hbmd1bGFyMi1xdWVyeS1idWlsZGVyL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9xdWVyeS1idWlsZGVyL3F1ZXJ5LWJ1aWxkZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCxpQkFBaUIsRUFDakIsYUFBYSxFQUdkLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFvQnZFLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixlQUFlLEVBQ2YsVUFBVSxFQUNWLEtBQUssRUFHTCxTQUFTLEVBR1QsU0FBUyxFQUNULFVBQVUsRUFDWCxNQUFNLGVBQWUsQ0FBQztBQUV2QixNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBUTtJQUN6QyxPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxF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QUN0QyxZQUFZLFNBQUMsbUJBQW1COzZCQUNoQyxZQUFZLFNBQUMsb0JBQW9COytCQUNqQyxZQUFZLFNBQUMsc0JBQXNCO21DQUNuQyxZQUFZLFNBQUMsMEJBQTBCO21DQUN2QyxZQUFZLFNBQUMsMEJBQTBCOzZCQUN2QyxlQUFlLFNBQUMsbUJBQW1CO2dDQUNuQyxZQUFZLFNBQUMsdUJBQXVCO29CQXNFcEMsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBOR19WQUxJREFUT1JTLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3Jcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgUXVlcnlPcGVyYXRvckRpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktb3BlcmF0b3IuZGlyZWN0aXZlJztcbmltcG9ydCB7IFF1ZXJ5RmllbGREaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWZpZWxkLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeUVudGl0eURpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktZW50aXR5LmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeVN3aXRjaEdyb3VwRGlyZWN0aXZlIH0gZnJvbSAnLi9xdWVyeS1zd2l0Y2gtZ3JvdXAuZGlyZWN0aXZlJztcbmltcG9ydCB7IFF1ZXJ5QnV0dG9uR3JvdXBEaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWJ1dHRvbi1ncm91cC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUXVlcnlJbnB1dERpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktaW5wdXQuZGlyZWN0aXZlJztcbmltcG9ydCB7IFF1ZXJ5UmVtb3ZlQnV0dG9uRGlyZWN0aXZlIH0gZnJvbSAnLi9xdWVyeS1yZW1vdmUtYnV0dG9uLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeUVtcHR5V2FybmluZ0RpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktZW1wdHktd2FybmluZy5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUXVlcnlBcnJvd0ljb25EaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWFycm93LWljb24uZGlyZWN0aXZlJztcbmltcG9ydCB7XG4gIEJ1dHRvbkdyb3VwQ29udGV4dCxcbiAgRW50aXR5LFxuICBGaWVsZCxcbiAgU3dpdGNoR3JvdXBDb250ZXh0LFxuICBFbnRpdHlDb250ZXh0LFxuICBGaWVsZENvbnRleHQsXG4gIElucHV0Q29udGV4dCxcbiAgTG9jYWxSdWxlTWV0YSxcbiAgT3BlcmF0b3JDb250ZXh0LFxuICBPcHRpb24sXG4gIFF1ZXJ5QnVpbGRlckNsYXNzTmFtZXMsXG4gIFF1ZXJ5QnVpbGRlckNvbmZpZyxcbiAgUmVtb3ZlQnV0dG9uQ29udGV4dCxcbiAgQXJyb3dJY29uQ29udGV4dCxcbiAgUnVsZSxcbiAgUnVsZVNldCxcbiAgRW1wdHlXYXJuaW5nQ29udGV4dCxcbn0gZnJvbSAnLi9xdWVyeS1idWlsZGVyLmludGVyZmFjZXMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29udGVudENoaWxkLFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIGZvcndhcmRSZWYsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uSW5pdCxcbiAgUXVlcnlMaXN0LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkLFxuICBFbGVtZW50UmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgQ09OVFJPTF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUXVlcnlCdWlsZGVyQ29tcG9uZW50KSxcbiAgbXVsdGk6IHRydWVcbn07XG5cbmV4cG9ydCBjb25zdCBWQUxJREFUT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMSURBVE9SUyxcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gUXVlcnlCdWlsZGVyQ29tcG9uZW50KSxcbiAgbXVsdGk6IHRydWVcbn07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3F1ZXJ5LWJ1aWxkZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vcXVlcnktYnVpbGRlci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3F1ZXJ5LWJ1aWxkZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgcHJvdmlkZXJzOiBbQ09OVFJPTF9WQUxVRV9BQ0NFU1NPUiwgVkFMSURBVE9SXVxufSlcbmV4cG9ydCBjbGFzcyBRdWVyeUJ1aWxkZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgQ29udHJvbFZhbHVlQWNjZXNzb3IsIFZhbGlkYXRvciB7XG4gIHB1YmxpYyBmaWVsZHM6IEZpZWxkW107XG4gIHB1YmxpYyBmaWx0ZXJGaWVsZHM6IEZpZWxkW107XG4gIHB1YmxpYyBlbnRpdGllczogRW50aXR5W107XG4gIHB1YmxpYyBkZWZhdWx0Q2xhc3NOYW1lczogUXVlcnlCdWlsZGVyQ2xhc3NOYW1lcyA9IHtcbiAgICBhcnJvd0ljb25CdXR0b246ICdxLWFycm93LWljb24tYnV0dG9uJyxcbiAgICBhcnJvd0ljb246ICdxLWljb24gcS1hcnJvdy1pY29uJyxcbiAgICByZW1vdmVJY29uOiAncS1pY29uIHEtcmVtb3ZlLWljb24nLFxuICAgIGFkZEljb246ICdxLWljb24gcS1hZGQtaWNvbicsXG4gICAgYnV0dG9uOiAncS1idXR0b24nLFxuICAgIGJ1dHRvbkdyb3VwOiAncS1idXR0b24tZ3JvdXAnLFxuICAgIHJlbW92ZUJ1dHRvbjogJ3EtcmVtb3ZlLWJ1dHRvbicsXG4gICAgc3dpdGNoR3JvdXA6ICdxLXN3aXRjaC1ncm91cCcsXG4gICAgc3dpdGNoTGFiZWw6ICdxLXN3aXRjaC1sYWJlbCcsXG4gICAgc3dpdGNoUmFkaW86ICdxLXN3aXRjaC1yYWRpbycsXG4gICAgcmlnaHRBbGlnbjogJ3EtcmlnaHQtYWxpZ24nLFxuICAgIHRyYW5zaXRpb246ICdxLXRyYW5zaXRpb24nLFxuICAgIGNvbGxhcHNlZDogJ3EtY29sbGFwc2VkJyxcbiAgICB0cmVlQ29udGFpbmVyOiAncS10cmVlLWNvbnRhaW5lcicsXG4gICAgdHJlZTogJ3EtdHJlZScsXG4gICAgcm93OiAncS1yb3cnLFxuICAgIGNvbm5lY3RvcjogJ3EtY29ubmVjdG9yJyxcbiAgICBydWxlOiAncS1ydWxlJyxcbiAgICBydWxlU2V0OiAncS1ydWxlc2V0JyxcbiAgICBpbnZhbGlkUnVsZVNldDogJ3EtaW52YWxpZC1ydWxlc2V0JyxcbiAgICBlbXB0eVdhcm5pbmc6ICdxLWVtcHR5LXdhcm5pbmcnLFxuICAgIGZpZWxkQ29udHJvbDogJ3EtZmllbGQtY29udHJvbCcsXG4gICAgZmllbGRDb250cm9sU2l6ZTogJ3EtY29udHJvbC1zaXplJyxcbiAgICBlbnRpdHlDb250cm9sOiAncS1lbnRpdHktY29udHJvbCcsXG4gICAgZW50aXR5Q29udHJvbFNpemU6ICdxLWNvbnRyb2wtc2l6ZScsXG4gICAgb3BlcmF0b3JDb250cm9sOiAncS1vcGVyYXRvci1jb250cm9sJyxcbiAgICBvcGVyYXRvckNvbnRyb2xTaXplOiAncS1jb250cm9sLXNpemUnLFxuICAgIGlucHV0Q29udHJvbDogJ3EtaW5wdXQtY29udHJvbCcsXG4gICAgaW5wdXRDb250cm9sU2l6ZTogJ3EtY29udHJvbC1zaXplJ1xuICB9O1xuICBwdWJsaWMgZGVmYXVsdE9wZXJhdG9yTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7XG4gICAgc3RyaW5nOiBbJz0nLCAnIT0nLCAnY29udGFpbnMnLCAnbGlrZSddLFxuICAgIG51bWJlcjogWyc9JywgJyE9JywgJz4nLCAnPj0nLCAnPCcsICc8PSddLFxuICAgIHRpbWU6IFsnPScsICchPScsICc+JywgJz49JywgJzwnLCAnPD0nXSxcbiAgICBkYXRlOiBbJz0nLCAnIT0nLCAnPicsICc+PScsICc8JywgJzw9J10sXG4gICAgY2F0ZWdvcnk6IFsnPScsICchPScsICdpbicsICdub3QgaW4nXSxcbiAgICBib29sZWFuOiBbJz0nXVxuICB9O1xuICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbjtcbiAgQElucHV0KCkgZGF0YTogUnVsZVNldCA9IHsgY29uZGl0aW9uOiAnYW5kJywgcnVsZXM6IFtdIH07XG5cbiAgLy8gRm9yIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxuICBwdWJsaWMgb25DaGFuZ2VDYWxsYmFjazogKCkgPT4gdm9pZDtcbiAgcHVibGljIG9uVG91Y2hlZENhbGxiYWNrOiAoKSA9PiBhbnk7XG5cbiAgQElucHV0KCkgYWxsb3dSdWxlc2V0OiBib29sZWFuID0gdHJ1ZTtcbiAgQElucHV0KCkgYWxsb3dDb2xsYXBzZTogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBlbXB0eU1lc3NhZ2U6IHN0cmluZyA9ICdBIHJ1bGVzZXQgY2Fubm90IGJlIGVtcHR5LiBQbGVhc2UgYWRkIGEgcnVsZSBvciByZW1vdmUgaXQgYWxsIHRvZ2V0aGVyLic7XG4gIEBJbnB1dCgpIGNsYXNzTmFtZXM6IFF1ZXJ5QnVpbGRlckNsYXNzTmFtZXM7XG4gIEBJbnB1dCgpIG9wZXJhdG9yTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH07XG4gIEBJbnB1dCgpIHBhcmVudFZhbHVlOiBSdWxlU2V0O1xuICBASW5wdXQoKSBjb25maWc6IFF1ZXJ5QnVpbGRlckNvbmZpZyA9IHsgZmllbGRzOiB7fSB9O1xuICBASW5wdXQoKSBwYXJlbnRBcnJvd0ljb25UZW1wbGF0ZTogUXVlcnlBcnJvd0ljb25EaXJlY3RpdmU7XG4gIEBJbnB1dCgpIHBhcmVudElucHV0VGVtcGxhdGVzOiBRdWVyeUxpc3Q8UXVlcnlJbnB1dERpcmVjdGl2ZT47XG4gIEBJbnB1dCgpIHBhcmVudE9wZXJhdG9yVGVtcGxhdGU6IFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmU7XG4gIEBJbnB1dCgpIHBhcmVudEZpZWxkVGVtcGxhdGU6IFF1ZXJ5RmllbGREaXJlY3RpdmU7XG4gIEBJbnB1dCgpIHBhcmVudEVudGl0eVRlbXBsYXRlOiBRdWVyeUVudGl0eURpcmVjdGl2ZTtcbiAgQElucHV0KCkgcGFyZW50U3dpdGNoR3JvdXBUZW1wbGF0ZTogUXVlcnlTd2l0Y2hHcm91cERpcmVjdGl2ZTtcbiAgQElucHV0KCkgcGFyZW50QnV0dG9uR3JvdXBUZW1wbGF0ZTogUXVlcnlCdXR0b25Hcm91cERpcmVjdGl2ZTtcbiAgQElucHV0KCkgcGFyZW50UmVtb3ZlQnV0dG9uVGVtcGxhdGU6IFF1ZXJ5UmVtb3ZlQnV0dG9uRGlyZWN0aXZlO1xuICBASW5wdXQoKSBwYXJlbnRFbXB0eVdhcm5pbmdUZW1wbGF0ZTogUXVlcnlFbXB0eVdhcm5pbmdEaXJlY3RpdmU7XG4gIEBJbnB1dCgpIHBhcmVudENoYW5nZUNhbGxiYWNrOiAoKSA9PiB2b2lkO1xuICBASW5wdXQoKSBwYXJlbnRUb3VjaGVkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG4gIEBJbnB1dCgpIHBlcnNpc3RWYWx1ZU9uRmllbGRDaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBAVmlld0NoaWxkKCd0cmVlQ29udGFpbmVyJywge3N0YXRpYzogdHJ1ZX0pIHRyZWVDb250YWluZXI6IEVsZW1lbnRSZWY7XG5cbiAgQENvbnRlbnRDaGlsZChRdWVyeUJ1dHRvbkdyb3VwRGlyZWN0aXZlKSBidXR0b25Hcm91cFRlbXBsYXRlOiBRdWVyeUJ1dHRvbkdyb3VwRGlyZWN0aXZlO1xuICBAQ29udGVudENoaWxkKFF1ZXJ5U3dpdGNoR3JvdXBEaXJlY3RpdmUpIHN3aXRjaEdyb3VwVGVtcGxhdGU6IFF1ZXJ5U3dpdGNoR3JvdXBEaXJlY3RpdmU7XG4gIEBDb250ZW50Q2hpbGQoUXVlcnlGaWVsZERpcmVjdGl2ZSkgZmllbGRUZW1wbGF0ZTogUXVlcnlGaWVsZERpcmVjdGl2ZTtcbiAgQENvbnRlbnRDaGlsZChRdWVyeUVudGl0eURpcmVjdGl2ZSkgZW50aXR5VGVtcGxhdGU6IFF1ZXJ5RW50aXR5RGlyZWN0aXZlO1xuICBAQ29udGVudENoaWxkKFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmUpIG9wZXJhdG9yVGVtcGxhdGU6IFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmU7XG4gIEBDb250ZW50Q2hpbGQoUXVlcnlSZW1vdmVCdXR0b25EaXJlY3RpdmUpIHJlbW92ZUJ1dHRvblRlbXBsYXRlOiBRdWVyeVJlbW92ZUJ1dHRvbkRpcmVjdGl2ZTtcbiAgQENvbnRlbnRDaGlsZChRdWVyeUVtcHR5V2FybmluZ0RpcmVjdGl2ZSkgZW1wdHlXYXJuaW5nVGVtcGxhdGU6IFF1ZXJ5RW1wdHlXYXJuaW5nRGlyZWN0aXZlO1xuICBAQ29udGVudENoaWxkcmVuKFF1ZXJ5SW5wdXREaXJlY3RpdmUpIGlucHV0VGVtcGxhdGVzOiBRdWVyeUxpc3Q8UXVlcnlJbnB1dERpcmVjdGl2ZT47XG4gIEBDb250ZW50Q2hpbGQoUXVlcnlBcnJvd0ljb25EaXJlY3RpdmUpIGFycm93SWNvblRlbXBsYXRlOiBRdWVyeUFycm93SWNvbkRpcmVjdGl2ZTtcblxuICBwcml2YXRlIGRlZmF1bHRUZW1wbGF0ZVR5cGVzOiBzdHJpbmdbXSA9IFtcbiAgICAnc3RyaW5nJywgJ251bWJlcicsICd0aW1lJywgJ2RhdGUnLCAnY2F0ZWdvcnknLCAnYm9vbGVhbicsICdtdWx0aXNlbGVjdCddO1xuICBwcml2YXRlIGRlZmF1bHRQZXJzaXN0VmFsdWVUeXBlczogc3RyaW5nW10gPSBbXG4gICAgJ3N0cmluZycsICdudW1iZXInLCAndGltZScsICdkYXRlJywgJ2Jvb2xlYW4nXTtcbiAgcHJpdmF0ZSBkZWZhdWx0RW1wdHlMaXN0OiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIG9wZXJhdG9yc0NhY2hlOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH07XG4gIHByaXZhdGUgaW5wdXRDb250ZXh0Q2FjaGUgPSBuZXcgTWFwPFJ1bGUsIElucHV0Q29udGV4dD4oKTtcbiAgcHJpdmF0ZSBvcGVyYXRvckNvbnRleHRDYWNoZSA9IG5ldyBNYXA8UnVsZSwgT3BlcmF0b3JDb250ZXh0PigpO1xuICBwcml2YXRlIGZpZWxkQ29udGV4dENhY2hlID0gbmV3IE1hcDxSdWxlLCBGaWVsZENvbnRleHQ+KCk7XG4gIHByaXZhdGUgZW50aXR5Q29udGV4dENhY2hlID0gbmV3IE1hcDxSdWxlLCBFbnRpdHlDb250ZXh0PigpO1xuICBwcml2YXRlIHJlbW92ZUJ1dHRvbkNvbnRleHRDYWNoZSA9IG5ldyBNYXA8UnVsZSwgUmVtb3ZlQnV0dG9uQ29udGV4dD4oKTtcbiAgcHJpdmF0ZSBidXR0b25Hcm91cENvbnRleHQ6IEJ1dHRvbkdyb3VwQ29udGV4dDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZikgeyB9XG5cbiAgLy8gLS0tLS0tLS0tLU9uSW5pdCBJbXBsZW1lbnRhdGlvbi0tLS0tLS0tLS1cblxuICBuZ09uSW5pdCgpIHsgfVxuXG4gIC8vIC0tLS0tLS0tLS1PbkNoYW5nZXMgSW1wbGVtZW50YXRpb24tLS0tLS0tLS0tXG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnO1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgY29uZmlnO1xuICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgdGhpcy5maWVsZHMgPSBPYmplY3Qua2V5cyhjb25maWcuZmllbGRzKS5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZWxkID0gY29uZmlnLmZpZWxkc1t2YWx1ZV07XG4gICAgICAgIGZpZWxkLnZhbHVlID0gZmllbGQudmFsdWUgfHwgdmFsdWU7XG4gICAgICAgIHJldHVybiBmaWVsZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGNvbmZpZy5lbnRpdGllcykge1xuICAgICAgICB0aGlzLmVudGl0aWVzID0gT2JqZWN0LmtleXMoY29uZmlnLmVudGl0aWVzKS5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgY29uc3QgZW50aXR5ID0gY29uZmlnLmVudGl0aWVzW3ZhbHVlXTtcbiAgICAgICAgICBlbnRpdHkudmFsdWUgPSBlbnRpdHkudmFsdWUgfHwgdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMub3BlcmF0b3JzQ2FjaGUgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnY29uZmlnJyBtdXN0IGJlIGEgdmFsaWQgb2JqZWN0LCBnb3QgJHt0eXBlfSBpbnN0ZWFkLmApO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS1WYWxpZGF0b3IgSW1wbGVtZW50YXRpb24tLS0tLS0tLS0tXG5cbiAgdmFsaWRhdGUoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIGNvbnN0IGVycm9yczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICAgIGNvbnN0IHJ1bGVFcnJvclN0b3JlID0gW107XG4gICAgbGV0IGhhc0Vycm9ycyA9IGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLmNvbmZpZy5hbGxvd0VtcHR5UnVsZXNldHMgJiYgdGhpcy5jaGVja0VtcHR5UnVsZUluUnVsZXNldCh0aGlzLmRhdGEpKSB7XG4gICAgICBlcnJvcnMuZW1wdHkgPSAnRW1wdHkgcnVsZXNldHMgYXJlIG5vdCBhbGxvd2VkLic7XG4gICAgICBoYXNFcnJvcnMgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMudmFsaWRhdGVSdWxlc0luUnVsZXNldCh0aGlzLmRhdGEsIHJ1bGVFcnJvclN0b3JlKTtcblxuICAgIGlmIChydWxlRXJyb3JTdG9yZS5sZW5ndGgpIHtcbiAgICAgIGVycm9ycy5ydWxlcyA9IHJ1bGVFcnJvclN0b3JlO1xuICAgICAgaGFzRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0Vycm9ycyA/IGVycm9ycyA6IG51bGw7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tQ29udHJvbFZhbHVlQWNjZXNzb3IgSW1wbGVtZW50YXRpb24tLS0tLS0tLS0tXG5cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IFJ1bGVTZXQge1xuICAgIHJldHVybiB0aGlzLmRhdGE7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBSdWxlU2V0KSB7XG4gICAgLy8gV2hlbiBjb21wb25lbnQgaXMgaW5pdGlhbGl6ZWQgd2l0aG91dCBhIGZvcm1Db250cm9sLCBudWxsIGlzIHBhc3NlZCB0byB2YWx1ZVxuICAgIHRoaXMuZGF0YSA9IHZhbHVlIHx8IHsgY29uZGl0aW9uOiAnYW5kJywgcnVsZXM6IFtdIH07XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICB3cml0ZVZhbHVlKG9iajogYW55KTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZSA9IG9iajtcbiAgfVxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sgPSAoKSA9PiBmbih0aGlzLmRhdGEpO1xuICB9XG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrID0gKCkgPT4gZm4odGhpcy5kYXRhKTtcbiAgfVxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS1FTkQtLS0tLS0tLS0tXG5cbiAgZ2V0RGlzYWJsZWRTdGF0ZSA9ICgpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZDtcbiAgfVxuXG4gIGZpbmRUZW1wbGF0ZUZvclJ1bGUocnVsZTogUnVsZSk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldElucHV0VHlwZShydWxlLmZpZWxkLCBydWxlLm9wZXJhdG9yKTtcbiAgICBpZiAodHlwZSkge1xuICAgICAgY29uc3QgcXVlcnlJbnB1dCA9IHRoaXMuZmluZFF1ZXJ5SW5wdXQodHlwZSk7XG4gICAgICBpZiAocXVlcnlJbnB1dCkge1xuICAgICAgICByZXR1cm4gcXVlcnlJbnB1dC50ZW1wbGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRUZW1wbGF0ZVR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgZmluZCB0ZW1wbGF0ZSBmb3IgZmllbGQgd2l0aCB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFF1ZXJ5SW5wdXQodHlwZTogc3RyaW5nKTogUXVlcnlJbnB1dERpcmVjdGl2ZSB7XG4gICAgY29uc3QgdGVtcGxhdGVzID0gdGhpcy5wYXJlbnRJbnB1dFRlbXBsYXRlcyB8fCB0aGlzLmlucHV0VGVtcGxhdGVzO1xuICAgIHJldHVybiB0ZW1wbGF0ZXMuZmluZCgoaXRlbSkgPT4gaXRlbS5xdWVyeUlucHV0VHlwZSA9PT0gdHlwZSk7XG4gIH1cblxuICBnZXRPcGVyYXRvcnMoZmllbGQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcnNDYWNoZVtmaWVsZF0pIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZXJhdG9yc0NhY2hlW2ZpZWxkXTtcbiAgICB9XG4gICAgbGV0IG9wZXJhdG9ycyA9IHRoaXMuZGVmYXVsdEVtcHR5TGlzdDtcbiAgICBjb25zdCBmaWVsZE9iamVjdCA9IHRoaXMuY29uZmlnLmZpZWxkc1tmaWVsZF07XG5cbiAgICBpZiAodGhpcy5jb25maWcuZ2V0T3BlcmF0b3JzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0T3BlcmF0b3JzKGZpZWxkLCBmaWVsZE9iamVjdCk7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9IGZpZWxkT2JqZWN0LnR5cGU7XG5cbiAgICBpZiAoZmllbGRPYmplY3QgJiYgZmllbGRPYmplY3Qub3BlcmF0b3JzKSB7XG4gICAgICBvcGVyYXRvcnMgPSBmaWVsZE9iamVjdC5vcGVyYXRvcnM7XG4gICAgfSBlbHNlIGlmICh0eXBlKSB7XG4gICAgICBvcGVyYXRvcnMgPSAodGhpcy5vcGVyYXRvck1hcCAmJiB0aGlzLm9wZXJhdG9yTWFwW3R5cGVdKSB8fCB0aGlzLmRlZmF1bHRPcGVyYXRvck1hcFt0eXBlXSB8fCB0aGlzLmRlZmF1bHRFbXB0eUxpc3Q7XG4gICAgICBpZiAob3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYE5vIG9wZXJhdG9ycyBmb3VuZCBmb3IgZmllbGQgJyR7ZmllbGR9JyB3aXRoIHR5cGUgJHtmaWVsZE9iamVjdC50eXBlfS4gYCArXG4gICAgICAgICAgYFBsZWFzZSBkZWZpbmUgYW4gJ29wZXJhdG9ycycgcHJvcGVydHkgb24gdGhlIGZpZWxkIG9yIHVzZSB0aGUgJ29wZXJhdG9yTWFwJyBiaW5kaW5nIHRvIGZpeCB0aGlzLmApO1xuICAgICAgfVxuICAgICAgaWYgKGZpZWxkT2JqZWN0Lm51bGxhYmxlKSB7XG4gICAgICAgIG9wZXJhdG9ycyA9IG9wZXJhdG9ycy5jb25jYXQoWydpcyBudWxsJywgJ2lzIG5vdCBudWxsJ10pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oYE5vICd0eXBlJyBwcm9wZXJ0eSBmb3VuZCBvbiBmaWVsZDogJyR7ZmllbGR9J2ApO1xuICAgIH1cblxuICAgIC8vIENhY2hlIHJlZmVyZW5jZSB0byBhcnJheSBvYmplY3QsIHNvIGl0IHdvbid0IGJlIGNvbXB1dGVkIG5leHQgdGltZSBhbmQgdHJpZ2dlciBhIHJlcmVuZGVyLlxuICAgIHRoaXMub3BlcmF0b3JzQ2FjaGVbZmllbGRdID0gb3BlcmF0b3JzO1xuICAgIHJldHVybiBvcGVyYXRvcnM7XG4gIH1cblxuICBnZXRGaWVsZHMoZW50aXR5OiBzdHJpbmcpOiBGaWVsZFtdIHtcbiAgICBpZiAodGhpcy5lbnRpdGllcyAmJiBlbnRpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpZWxkcy5maWx0ZXIoKGZpZWxkKSA9PiB7XG4gICAgICAgIHJldHVybiBmaWVsZCAmJiBmaWVsZC5lbnRpdHkgPT09IGVudGl0eTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5maWVsZHM7XG4gICAgfVxuICB9XG5cbiAgZ2V0SW5wdXRUeXBlKGZpZWxkOiBzdHJpbmcsIG9wZXJhdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmNvbmZpZy5nZXRJbnB1dFR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXRJbnB1dFR5cGUoZmllbGQsIG9wZXJhdG9yKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuY29uZmlnLmZpZWxkc1tmaWVsZF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gY29uZmlndXJhdGlvbiBmb3IgZmllbGQgJyR7ZmllbGR9JyBjb3VsZCBiZSBmb3VuZCEgUGxlYXNlIGFkZCBpdCB0byBjb25maWcuZmllbGRzLmApO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmNvbmZpZy5maWVsZHNbZmllbGRdLnR5cGU7XG4gICAgc3dpdGNoIChvcGVyYXRvcikge1xuICAgICAgY2FzZSAnaXMgbnVsbCc6XG4gICAgICBjYXNlICdpcyBub3QgbnVsbCc6XG4gICAgICAgIHJldHVybiBudWxsOyAgLy8gTm8gZGlzcGxheWVkIGNvbXBvbmVudFxuICAgICAgY2FzZSAnaW4nOlxuICAgICAgY2FzZSAnbm90IGluJzpcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdjYXRlZ29yeScgfHwgdHlwZSA9PT0gJ2Jvb2xlYW4nID8gJ211bHRpc2VsZWN0JyA6IHR5cGU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gIH1cblxuICBnZXRPcHRpb25zKGZpZWxkOiBzdHJpbmcpOiBPcHRpb25bXSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmdldE9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXRPcHRpb25zKGZpZWxkKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmZpZWxkc1tmaWVsZF0ub3B0aW9ucyB8fCB0aGlzLmRlZmF1bHRFbXB0eUxpc3Q7XG4gIH1cblxuICBnZXRDbGFzc05hbWVzKC4uLmFyZ3MpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNsc0xvb2t1cCA9IHRoaXMuY2xhc3NOYW1lcyA/IHRoaXMuY2xhc3NOYW1lcyA6IHRoaXMuZGVmYXVsdENsYXNzTmFtZXM7XG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IGFyZ3MubWFwKChpZCkgPT4gY2xzTG9va3VwW2lkXSB8fCB0aGlzLmRlZmF1bHRDbGFzc05hbWVzW2lkXSkuZmlsdGVyKChjKSA9PiAhIWMpO1xuICAgIHJldHVybiBjbGFzc05hbWVzLmxlbmd0aCA/IGNsYXNzTmFtZXMuam9pbignICcpIDogbnVsbDtcbiAgfVxuXG4gIGdldERlZmF1bHRGaWVsZChlbnRpdHk6IEVudGl0eSk6IEZpZWxkIHtcbiAgICBpZiAoIWVudGl0eSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChlbnRpdHkuZGVmYXVsdEZpZWxkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHRWYWx1ZShlbnRpdHkuZGVmYXVsdEZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZW50aXR5RmllbGRzID0gdGhpcy5maWVsZHMuZmlsdGVyKChmaWVsZCkgPT4ge1xuICAgICAgICByZXR1cm4gZmllbGQgJiYgZmllbGQuZW50aXR5ID09PSBlbnRpdHkudmFsdWU7XG4gICAgICB9KTtcbiAgICAgIGlmIChlbnRpdHlGaWVsZHMgJiYgZW50aXR5RmllbGRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZW50aXR5RmllbGRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBObyBmaWVsZHMgZm91bmQgZm9yIGVudGl0eSAnJHtlbnRpdHkubmFtZX0nLiBgICtcbiAgICAgICAgICBgQSAnZGVmYXVsdE9wZXJhdG9yJyBpcyBhbHNvIG5vdCBzcGVjaWZpZWQgb24gdGhlIGZpZWxkIGNvbmZpZy4gT3BlcmF0b3IgdmFsdWUgd2lsbCBkZWZhdWx0IHRvIG51bGwuYCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldERlZmF1bHRPcGVyYXRvcihmaWVsZDogRmllbGQpOiBzdHJpbmcge1xuICAgIGlmIChmaWVsZCAmJiBmaWVsZC5kZWZhdWx0T3BlcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdFZhbHVlKGZpZWxkLmRlZmF1bHRPcGVyYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0T3BlcmF0b3JzKGZpZWxkLnZhbHVlKTtcbiAgICAgIGlmIChvcGVyYXRvcnMgJiYgb3BlcmF0b3JzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb3BlcmF0b3JzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBObyBvcGVyYXRvcnMgZm91bmQgZm9yIGZpZWxkICcke2ZpZWxkLnZhbHVlfScuIGAgK1xuICAgICAgICAgIGBBICdkZWZhdWx0T3BlcmF0b3InIGlzIGFsc28gbm90IHNwZWNpZmllZCBvbiB0aGUgZmllbGQgY29uZmlnLiBPcGVyYXRvciB2YWx1ZSB3aWxsIGRlZmF1bHQgdG8gbnVsbC5gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkUnVsZShwYXJlbnQ/OiBSdWxlU2V0KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwYXJlbnQgPSBwYXJlbnQgfHwgdGhpcy5kYXRhO1xuICAgIGlmICh0aGlzLmNvbmZpZy5hZGRSdWxlKSB7XG4gICAgICB0aGlzLmNvbmZpZy5hZGRSdWxlKHBhcmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5maWVsZHNbMF07XG4gICAgICBwYXJlbnQucnVsZXMgPSBwYXJlbnQucnVsZXMuY29uY2F0KFt7XG4gICAgICAgIGZpZWxkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgb3BlcmF0b3I6IHRoaXMuZ2V0RGVmYXVsdE9wZXJhdG9yKGZpZWxkKSxcbiAgICAgICAgdmFsdWU6IHRoaXMuZ2V0RGVmYXVsdFZhbHVlKGZpZWxkLmRlZmF1bHRWYWx1ZSksXG4gICAgICAgIGVudGl0eTogZmllbGQuZW50aXR5XG4gICAgICB9XSk7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICByZW1vdmVSdWxlKHJ1bGU6IFJ1bGUsIHBhcmVudD86IFJ1bGVTZXQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBhcmVudCA9IHBhcmVudCB8fCB0aGlzLmRhdGE7XG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbW92ZVJ1bGUpIHtcbiAgICAgIHRoaXMuY29uZmlnLnJlbW92ZVJ1bGUocnVsZSwgcGFyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50LnJ1bGVzID0gcGFyZW50LnJ1bGVzLmZpbHRlcigocikgPT4gciAhPT0gcnVsZSk7XG4gICAgfVxuICAgIHRoaXMuaW5wdXRDb250ZXh0Q2FjaGUuZGVsZXRlKHJ1bGUpO1xuICAgIHRoaXMub3BlcmF0b3JDb250ZXh0Q2FjaGUuZGVsZXRlKHJ1bGUpO1xuICAgIHRoaXMuZmllbGRDb250ZXh0Q2FjaGUuZGVsZXRlKHJ1bGUpO1xuICAgIHRoaXMuZW50aXR5Q29udGV4dENhY2hlLmRlbGV0ZShydWxlKTtcbiAgICB0aGlzLnJlbW92ZUJ1dHRvbkNvbnRleHRDYWNoZS5kZWxldGUocnVsZSk7XG5cbiAgICB0aGlzLmhhbmRsZVRvdWNoZWQoKTtcbiAgICB0aGlzLmhhbmRsZURhdGFDaGFuZ2UoKTtcbiAgfVxuXG4gIGFkZFJ1bGVTZXQocGFyZW50PzogUnVsZVNldCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcGFyZW50ID0gcGFyZW50IHx8IHRoaXMuZGF0YTtcbiAgICBpZiAodGhpcy5jb25maWcuYWRkUnVsZVNldCkge1xuICAgICAgdGhpcy5jb25maWcuYWRkUnVsZVNldChwYXJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQucnVsZXMgPSBwYXJlbnQucnVsZXMuY29uY2F0KFt7IGNvbmRpdGlvbjogJ2FuZCcsIHJ1bGVzOiBbXSB9XSk7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICByZW1vdmVSdWxlU2V0KHJ1bGVzZXQ/OiBSdWxlU2V0LCBwYXJlbnQ/OiBSdWxlU2V0KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBydWxlc2V0ID0gcnVsZXNldCB8fCB0aGlzLmRhdGE7XG4gICAgcGFyZW50ID0gcGFyZW50IHx8IHRoaXMucGFyZW50VmFsdWU7XG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbW92ZVJ1bGVTZXQpIHtcbiAgICAgIHRoaXMuY29uZmlnLnJlbW92ZVJ1bGVTZXQocnVsZXNldCwgcGFyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50LnJ1bGVzID0gcGFyZW50LnJ1bGVzLmZpbHRlcigocikgPT4gciAhPT0gcnVsZXNldCk7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICB0cmFuc2l0aW9uRW5kKGU6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy50cmVlQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gbnVsbDtcbiAgfVxuXG4gIHRvZ2dsZUNvbGxhcHNlKCk6IHZvaWQge1xuICAgIHRoaXMuY29tcHV0ZWRUcmVlQ29udGFpbmVySGVpZ2h0KCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmRhdGEuY29sbGFwc2VkID0gIXRoaXMuZGF0YS5jb2xsYXBzZWQ7XG4gICAgfSwgMTAwKTtcbiAgfVxuXG4gIGNvbXB1dGVkVHJlZUNvbnRhaW5lckhlaWdodCgpOiB2b2lkIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50OiBIVE1MRWxlbWVudCA9IHRoaXMudHJlZUNvbnRhaW5lci5uYXRpdmVFbGVtZW50O1xuICAgIGlmIChuYXRpdmVFbGVtZW50ICYmIG5hdGl2ZUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQpIHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gKG5hdGl2ZUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQuY2xpZW50SGVpZ2h0ICsgOCkgKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZUNvbmRpdGlvbih2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuY29uZGl0aW9uID0gdmFsdWU7XG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICBjaGFuZ2VPcGVyYXRvcihydWxlOiBSdWxlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWcuY29lcmNlVmFsdWVGb3JPcGVyYXRvcikge1xuICAgICAgcnVsZS52YWx1ZSA9IHRoaXMuY29uZmlnLmNvZXJjZVZhbHVlRm9yT3BlcmF0b3IocnVsZS5vcGVyYXRvciwgcnVsZS52YWx1ZSwgcnVsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJ1bGUudmFsdWUgPSB0aGlzLmNvZXJjZVZhbHVlRm9yT3BlcmF0b3IocnVsZS5vcGVyYXRvciwgcnVsZS52YWx1ZSwgcnVsZSk7XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICBjb2VyY2VWYWx1ZUZvck9wZXJhdG9yKG9wZXJhdG9yOiBzdHJpbmcsIHZhbHVlOiBhbnksIHJ1bGU6IFJ1bGUpOiBhbnkge1xuICAgIGNvbnN0IGlucHV0VHlwZTogc3RyaW5nID0gdGhpcy5nZXRJbnB1dFR5cGUocnVsZS5maWVsZCwgb3BlcmF0b3IpO1xuICAgIGlmIChpbnB1dFR5cGUgPT09ICdtdWx0aXNlbGVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3ZhbHVlXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgY2hhbmdlSW5wdXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmhhbmRsZVRvdWNoZWQoKTtcbiAgICB0aGlzLmhhbmRsZURhdGFDaGFuZ2UoKTtcbiAgfVxuXG4gIGNoYW5nZUZpZWxkKGZpZWxkVmFsdWU6IHN0cmluZywgcnVsZTogUnVsZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRDb250ZXh0ID0gdGhpcy5pbnB1dENvbnRleHRDYWNoZS5nZXQocnVsZSk7XG4gICAgY29uc3QgY3VycmVudEZpZWxkID0gaW5wdXRDb250ZXh0ICYmIGlucHV0Q29udGV4dC5maWVsZDtcblxuICAgIGNvbnN0IG5leHRGaWVsZDogRmllbGQgPSB0aGlzLmNvbmZpZy5maWVsZHNbZmllbGRWYWx1ZV07XG5cbiAgICBjb25zdCBuZXh0VmFsdWUgPSB0aGlzLmNhbGN1bGF0ZUZpZWxkQ2hhbmdlVmFsdWUoXG4gICAgICBjdXJyZW50RmllbGQsIG5leHRGaWVsZCwgcnVsZS52YWx1ZSk7XG5cbiAgICBpZiAobmV4dFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bGUudmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBydWxlLnZhbHVlO1xuICAgIH1cblxuICAgIHJ1bGUub3BlcmF0b3IgPSB0aGlzLmdldERlZmF1bHRPcGVyYXRvcihuZXh0RmllbGQpO1xuXG4gICAgLy8gQ3JlYXRlIG5ldyBjb250ZXh0IG9iamVjdHMgc28gdGVtcGxhdGVzIHdpbGwgYXV0b21hdGljYWxseSB1cGRhdGVcbiAgICB0aGlzLmlucHV0Q29udGV4dENhY2hlLmRlbGV0ZShydWxlKTtcbiAgICB0aGlzLm9wZXJhdG9yQ29udGV4dENhY2hlLmRlbGV0ZShydWxlKTtcbiAgICB0aGlzLmZpZWxkQ29udGV4dENhY2hlLmRlbGV0ZShydWxlKTtcbiAgICB0aGlzLmVudGl0eUNvbnRleHRDYWNoZS5kZWxldGUocnVsZSk7XG4gICAgdGhpcy5nZXRJbnB1dENvbnRleHQocnVsZSk7XG4gICAgdGhpcy5nZXRGaWVsZENvbnRleHQocnVsZSk7XG4gICAgdGhpcy5nZXRPcGVyYXRvckNvbnRleHQocnVsZSk7XG4gICAgdGhpcy5nZXRFbnRpdHlDb250ZXh0KHJ1bGUpO1xuXG4gICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgdGhpcy5oYW5kbGVEYXRhQ2hhbmdlKCk7XG4gIH1cblxuICBjaGFuZ2VFbnRpdHkoZW50aXR5VmFsdWU6IHN0cmluZywgcnVsZTogUnVsZSwgaW5kZXg6IG51bWJlciwgZGF0YTogUnVsZVNldCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBpID0gaW5kZXg7XG4gICAgbGV0IHJzID0gZGF0YTtcbiAgICBjb25zdCBlbnRpdHk6IEVudGl0eSA9IHRoaXMuZW50aXRpZXMuZmluZCgoZSkgPT4gZS52YWx1ZSA9PT0gZW50aXR5VmFsdWUpO1xuICAgIGNvbnN0IGRlZmF1bHRGaWVsZDogRmllbGQgPSB0aGlzLmdldERlZmF1bHRGaWVsZChlbnRpdHkpO1xuICAgIGlmICghcnMpIHtcbiAgICAgIHJzID0gdGhpcy5kYXRhO1xuICAgICAgaSA9IHJzLnJ1bGVzLmZpbmRJbmRleCgoeCkgPT4geCA9PT0gcnVsZSk7XG4gICAgfVxuICAgIHJ1bGUuZmllbGQgPSBkZWZhdWx0RmllbGQudmFsdWU7XG4gICAgcnMucnVsZXNbaV0gPSBydWxlO1xuICAgIGlmIChkZWZhdWx0RmllbGQpIHtcbiAgICAgIHRoaXMuY2hhbmdlRmllbGQoZGVmYXVsdEZpZWxkLnZhbHVlLCBydWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYW5kbGVUb3VjaGVkKCk7XG4gICAgICB0aGlzLmhhbmRsZURhdGFDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXREZWZhdWx0VmFsdWUoZGVmYXVsdFZhbHVlOiBhbnkpOiBhbnkge1xuICAgIHN3aXRjaCAodHlwZW9mIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIGdldE9wZXJhdG9yVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgY29uc3QgdCA9IHRoaXMucGFyZW50T3BlcmF0b3JUZW1wbGF0ZSB8fCB0aGlzLm9wZXJhdG9yVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldEZpZWxkVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgY29uc3QgdCA9IHRoaXMucGFyZW50RmllbGRUZW1wbGF0ZSB8fCB0aGlzLmZpZWxkVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldEVudGl0eVRlbXBsYXRlKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGNvbnN0IHQgPSB0aGlzLnBhcmVudEVudGl0eVRlbXBsYXRlIHx8IHRoaXMuZW50aXR5VGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldEFycm93SWNvblRlbXBsYXRlKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGNvbnN0IHQgPSB0aGlzLnBhcmVudEFycm93SWNvblRlbXBsYXRlIHx8IHRoaXMuYXJyb3dJY29uVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldEJ1dHRvbkdyb3VwVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgY29uc3QgdCA9IHRoaXMucGFyZW50QnV0dG9uR3JvdXBUZW1wbGF0ZSB8fCB0aGlzLmJ1dHRvbkdyb3VwVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldFN3aXRjaEdyb3VwVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgY29uc3QgdCA9IHRoaXMucGFyZW50U3dpdGNoR3JvdXBUZW1wbGF0ZSB8fCB0aGlzLnN3aXRjaEdyb3VwVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldFJlbW92ZUJ1dHRvblRlbXBsYXRlKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGNvbnN0IHQgPSB0aGlzLnBhcmVudFJlbW92ZUJ1dHRvblRlbXBsYXRlIHx8IHRoaXMucmVtb3ZlQnV0dG9uVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldEVtcHR5V2FybmluZ1RlbXBsYXRlKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIGNvbnN0IHQgPSB0aGlzLnBhcmVudEVtcHR5V2FybmluZ1RlbXBsYXRlIHx8IHRoaXMuZW1wdHlXYXJuaW5nVGVtcGxhdGU7XG4gICAgcmV0dXJuIHQgPyB0LnRlbXBsYXRlIDogbnVsbDtcbiAgfVxuXG4gIGdldFF1ZXJ5SXRlbUNsYXNzTmFtZShsb2NhbDogTG9jYWxSdWxlTWV0YSk6IHN0cmluZyB7XG4gICAgbGV0IGNscyA9IHRoaXMuZ2V0Q2xhc3NOYW1lcygncm93JywgJ2Nvbm5lY3RvcicsICd0cmFuc2l0aW9uJyk7XG4gICAgY2xzICs9ICcgJyArIHRoaXMuZ2V0Q2xhc3NOYW1lcyhsb2NhbC5ydWxlc2V0ID8gJ3J1bGVTZXQnIDogJ3J1bGUnKTtcbiAgICBpZiAobG9jYWwuaW52YWxpZCkge1xuICAgICAgY2xzICs9ICcgJyArIHRoaXMuZ2V0Q2xhc3NOYW1lcygnaW52YWxpZFJ1bGVTZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGNscztcbiAgfVxuXG4gIGdldEJ1dHRvbkdyb3VwQ29udGV4dCgpOiBCdXR0b25Hcm91cENvbnRleHQge1xuICAgIGlmICghdGhpcy5idXR0b25Hcm91cENvbnRleHQpIHtcbiAgICAgIHRoaXMuYnV0dG9uR3JvdXBDb250ZXh0ID0ge1xuICAgICAgICBhZGRSdWxlOiB0aGlzLmFkZFJ1bGUuYmluZCh0aGlzKSxcbiAgICAgICAgYWRkUnVsZVNldDogdGhpcy5hbGxvd1J1bGVzZXQgJiYgdGhpcy5hZGRSdWxlU2V0LmJpbmQodGhpcyksXG4gICAgICAgIHJlbW92ZVJ1bGVTZXQ6IHRoaXMuYWxsb3dSdWxlc2V0ICYmIHRoaXMucGFyZW50VmFsdWUgJiYgdGhpcy5yZW1vdmVSdWxlU2V0LmJpbmQodGhpcyksXG4gICAgICAgIGdldERpc2FibGVkU3RhdGU6IHRoaXMuZ2V0RGlzYWJsZWRTdGF0ZSxcbiAgICAgICAgJGltcGxpY2l0OiB0aGlzLmRhdGFcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJ1dHRvbkdyb3VwQ29udGV4dDtcbiAgfVxuXG4gIGdldFJlbW92ZUJ1dHRvbkNvbnRleHQocnVsZTogUnVsZSk6IFJlbW92ZUJ1dHRvbkNvbnRleHQge1xuICAgIGlmICghdGhpcy5yZW1vdmVCdXR0b25Db250ZXh0Q2FjaGUuaGFzKHJ1bGUpKSB7XG4gICAgICB0aGlzLnJlbW92ZUJ1dHRvbkNvbnRleHRDYWNoZS5zZXQocnVsZSwge1xuICAgICAgICByZW1vdmVSdWxlOiB0aGlzLnJlbW92ZVJ1bGUuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0RGlzYWJsZWRTdGF0ZTogdGhpcy5nZXREaXNhYmxlZFN0YXRlLFxuICAgICAgICAkaW1wbGljaXQ6IHJ1bGVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW1vdmVCdXR0b25Db250ZXh0Q2FjaGUuZ2V0KHJ1bGUpO1xuICB9XG5cbiAgZ2V0RmllbGRDb250ZXh0KHJ1bGU6IFJ1bGUpOiBGaWVsZENvbnRleHQge1xuICAgIGlmICghdGhpcy5maWVsZENvbnRleHRDYWNoZS5oYXMocnVsZSkpIHtcbiAgICAgIHRoaXMuZmllbGRDb250ZXh0Q2FjaGUuc2V0KHJ1bGUsIHtcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMuY2hhbmdlRmllbGQuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0RmllbGRzOiB0aGlzLmdldEZpZWxkcy5iaW5kKHRoaXMpLFxuICAgICAgICBnZXREaXNhYmxlZFN0YXRlOiB0aGlzLmdldERpc2FibGVkU3RhdGUsXG4gICAgICAgIGZpZWxkczogdGhpcy5maWVsZHMsXG4gICAgICAgICRpbXBsaWNpdDogcnVsZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpZWxkQ29udGV4dENhY2hlLmdldChydWxlKTtcbiAgfVxuXG4gIGdldEVudGl0eUNvbnRleHQocnVsZTogUnVsZSk6IEVudGl0eUNvbnRleHQge1xuICAgIGlmICghdGhpcy5lbnRpdHlDb250ZXh0Q2FjaGUuaGFzKHJ1bGUpKSB7XG4gICAgICB0aGlzLmVudGl0eUNvbnRleHRDYWNoZS5zZXQocnVsZSwge1xuICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VFbnRpdHkuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0RGlzYWJsZWRTdGF0ZTogdGhpcy5nZXREaXNhYmxlZFN0YXRlLFxuICAgICAgICBlbnRpdGllczogdGhpcy5lbnRpdGllcyxcbiAgICAgICAgJGltcGxpY2l0OiBydWxlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5Q29udGV4dENhY2hlLmdldChydWxlKTtcbiAgfVxuXG4gIGdldFN3aXRjaEdyb3VwQ29udGV4dCgpOiBTd2l0Y2hHcm91cENvbnRleHQge1xuICAgIHJldHVybiB7XG4gICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VDb25kaXRpb24uYmluZCh0aGlzKSxcbiAgICAgIGdldERpc2FibGVkU3RhdGU6IHRoaXMuZ2V0RGlzYWJsZWRTdGF0ZSxcbiAgICAgICRpbXBsaWNpdDogdGhpcy5kYXRhXG4gICAgfTtcbiAgfVxuXG4gIGdldEFycm93SWNvbkNvbnRleHQoKTogQXJyb3dJY29uQ29udGV4dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldERpc2FibGVkU3RhdGU6IHRoaXMuZ2V0RGlzYWJsZWRTdGF0ZSxcbiAgICAgICRpbXBsaWNpdDogdGhpcy5kYXRhXG4gICAgfTtcbiAgfVxuXG4gIGdldEVtcHR5V2FybmluZ0NvbnRleHQoKTogRW1wdHlXYXJuaW5nQ29udGV4dCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldERpc2FibGVkU3RhdGU6IHRoaXMuZ2V0RGlzYWJsZWRTdGF0ZSxcbiAgICAgIG1lc3NhZ2U6IHRoaXMuZW1wdHlNZXNzYWdlLFxuICAgICAgJGltcGxpY2l0OiB0aGlzLmRhdGFcbiAgICB9O1xuICB9XG5cbiAgZ2V0T3BlcmF0b3JDb250ZXh0KHJ1bGU6IFJ1bGUpOiBPcGVyYXRvckNvbnRleHQge1xuICAgIGlmICghdGhpcy5vcGVyYXRvckNvbnRleHRDYWNoZS5oYXMocnVsZSkpIHtcbiAgICAgIHRoaXMub3BlcmF0b3JDb250ZXh0Q2FjaGUuc2V0KHJ1bGUsIHtcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMuY2hhbmdlT3BlcmF0b3IuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0RGlzYWJsZWRTdGF0ZTogdGhpcy5nZXREaXNhYmxlZFN0YXRlLFxuICAgICAgICBvcGVyYXRvcnM6IHRoaXMuZ2V0T3BlcmF0b3JzKHJ1bGUuZmllbGQpLFxuICAgICAgICAkaW1wbGljaXQ6IHJ1bGVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvckNvbnRleHRDYWNoZS5nZXQocnVsZSk7XG4gIH1cblxuICBnZXRJbnB1dENvbnRleHQocnVsZTogUnVsZSk6IElucHV0Q29udGV4dCB7XG4gICAgaWYgKCF0aGlzLmlucHV0Q29udGV4dENhY2hlLmhhcyhydWxlKSkge1xuICAgICAgdGhpcy5pbnB1dENvbnRleHRDYWNoZS5zZXQocnVsZSwge1xuICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VJbnB1dC5iaW5kKHRoaXMpLFxuICAgICAgICBnZXREaXNhYmxlZFN0YXRlOiB0aGlzLmdldERpc2FibGVkU3RhdGUsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMuZ2V0T3B0aW9ucyhydWxlLmZpZWxkKSxcbiAgICAgICAgZmllbGQ6IHRoaXMuY29uZmlnLmZpZWxkc1tydWxlLmZpZWxkXSxcbiAgICAgICAgJGltcGxpY2l0OiBydWxlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRDb250ZXh0Q2FjaGUuZ2V0KHJ1bGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVGaWVsZENoYW5nZVZhbHVlKFxuICAgIGN1cnJlbnRGaWVsZDogRmllbGQsXG4gICAgbmV4dEZpZWxkOiBGaWVsZCxcbiAgICBjdXJyZW50VmFsdWU6IGFueVxuICApOiBhbnkge1xuXG4gICAgaWYgKHRoaXMuY29uZmlnLmNhbGN1bGF0ZUZpZWxkQ2hhbmdlVmFsdWUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmNhbGN1bGF0ZUZpZWxkQ2hhbmdlVmFsdWUoXG4gICAgICAgIGN1cnJlbnRGaWVsZCwgbmV4dEZpZWxkLCBjdXJyZW50VmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbktlZXBWYWx1ZSA9ICgpID0+IHtcbiAgICAgIGlmIChjdXJyZW50RmllbGQgPT0gbnVsbCB8fCBuZXh0RmllbGQgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudEZpZWxkLnR5cGUgPT09IG5leHRGaWVsZC50eXBlXG4gICAgICAgICYmIHRoaXMuZGVmYXVsdFBlcnNpc3RWYWx1ZVR5cGVzLmluZGV4T2YoY3VycmVudEZpZWxkLnR5cGUpICE9PSAtMTtcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMucGVyc2lzdFZhbHVlT25GaWVsZENoYW5nZSAmJiBjYW5LZWVwVmFsdWUoKSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobmV4dEZpZWxkICYmIG5leHRGaWVsZC5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdFZhbHVlKG5leHRGaWVsZC5kZWZhdWx0VmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGNoZWNrRW1wdHlSdWxlSW5SdWxlc2V0KHJ1bGVzZXQ6IFJ1bGVTZXQpOiBib29sZWFuIHtcbiAgICBpZiAoIXJ1bGVzZXQgfHwgIXJ1bGVzZXQucnVsZXMgfHwgcnVsZXNldC5ydWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcnVsZXNldC5ydWxlcy5zb21lKChpdGVtOiBSdWxlU2V0KSA9PiB7XG4gICAgICAgIGlmIChpdGVtLnJ1bGVzKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tFbXB0eVJ1bGVJblJ1bGVzZXQoaXRlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZhbGlkYXRlUnVsZXNJblJ1bGVzZXQocnVsZXNldDogUnVsZVNldCwgZXJyb3JTdG9yZTogYW55W10pIHtcbiAgICBpZiAocnVsZXNldCAmJiBydWxlc2V0LnJ1bGVzICYmIHJ1bGVzZXQucnVsZXMubGVuZ3RoID4gMCkge1xuICAgICAgcnVsZXNldC5ydWxlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGlmICgoaXRlbSBhcyBSdWxlU2V0KS5ydWxlcykge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlUnVsZXNJblJ1bGVzZXQoaXRlbSBhcyBSdWxlU2V0LCBlcnJvclN0b3JlKTtcbiAgICAgICAgfSBlbHNlIGlmICgoaXRlbSBhcyBSdWxlKS5maWVsZCkge1xuICAgICAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5jb25maWcuZmllbGRzWyhpdGVtIGFzIFJ1bGUpLmZpZWxkXTtcbiAgICAgICAgICBpZiAoZmllbGQgJiYgZmllbGQudmFsaWRhdG9yICYmIGZpZWxkLnZhbGlkYXRvci5hcHBseSkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBmaWVsZC52YWxpZGF0b3IoaXRlbSBhcyBSdWxlLCBydWxlc2V0KTtcbiAgICAgICAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGVycm9yU3RvcmUucHVzaChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZURhdGFDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICBpZiAodGhpcy5vbkNoYW5nZUNhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFyZW50Q2hhbmdlQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMucGFyZW50Q2hhbmdlQ2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVRvdWNoZWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMub25Ub3VjaGVkQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFyZW50VG91Y2hlZENhbGxiYWNrKSB7XG4gICAgICB0aGlzLnBhcmVudFRvdWNoZWRDYWxsYmFjaygpO1xuICAgIH1cbiAgfVxufVxuIl19