import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormsModule } from '@angular/forms';
import { Directive, TemplateRef, Input, forwardRef, Component, ChangeDetectorRef, ViewChild, ContentChild, ContentChildren, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

class QueryOperatorDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryOperatorDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryOperator]' },] }
];
QueryOperatorDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryFieldDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryFieldDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryField]' },] }
];
QueryFieldDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryEntityDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryEntityDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryEntity]' },] }
];
QueryEntityDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QuerySwitchGroupDirective {
    constructor(template) {
        this.template = template;
    }
}
QuerySwitchGroupDirective.decorators = [
    { type: Directive, args: [{ selector: '[querySwitchGroup]' },] }
];
QuerySwitchGroupDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryButtonGroupDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryButtonGroupDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryButtonGroup]' },] }
];
QueryButtonGroupDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryInputDirective {
    constructor(template) {
        this.template = template;
    }
    /** Unique name for query input type. */
    get queryInputType() { return this._type; }
    set queryInputType(value) {
        // If the directive is set without a type (updated programatically), then this setter will
        // trigger with an empty string and should not overwrite the programatically set value.
        if (!value) {
            return;
        }
        this._type = value;
    }
}
QueryInputDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryInput]' },] }
];
QueryInputDirective.ctorParameters = () => [
    { type: TemplateRef }
];
QueryInputDirective.propDecorators = {
    queryInputType: [{ type: Input }]
};

class QueryRemoveButtonDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryRemoveButtonDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryRemoveButton]' },] }
];
QueryRemoveButtonDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryEmptyWarningDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryEmptyWarningDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryEmptyWarning]' },] }
];
QueryEmptyWarningDirective.ctorParameters = () => [
    { type: TemplateRef }
];

class QueryArrowIconDirective {
    constructor(template) {
        this.template = template;
    }
}
QueryArrowIconDirective.decorators = [
    { type: Directive, args: [{ selector: '[queryArrowIcon]' },] }
];
QueryArrowIconDirective.ctorParameters = () => [
    { type: TemplateRef }
];

const CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => QueryBuilderComponent),
    multi: true
};
const VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => QueryBuilderComponent),
    multi: true
};
class QueryBuilderComponent {
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

class QueryBuilderModule {
}
QueryBuilderModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule
                ],
                declarations: [
                    QueryBuilderComponent,
                    QueryInputDirective,
                    QueryOperatorDirective,
                    QueryFieldDirective,
                    QueryEntityDirective,
                    QueryButtonGroupDirective,
                    QuerySwitchGroupDirective,
                    QueryRemoveButtonDirective,
                    QueryEmptyWarningDirective,
                    QueryArrowIconDirective
                ],
                exports: [
                    QueryBuilderComponent,
                    QueryInputDirective,
                    QueryOperatorDirective,
                    QueryFieldDirective,
                    QueryEntityDirective,
                    QueryButtonGroupDirective,
                    QuerySwitchGroupDirective,
                    QueryRemoveButtonDirective,
                    QueryEmptyWarningDirective,
                    QueryArrowIconDirective
                ]
            },] }
];

/*
 * Public API Surface of angular2-query-builder
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CONTROL_VALUE_ACCESSOR, QueryArrowIconDirective, QueryBuilderComponent, QueryBuilderModule, QueryButtonGroupDirective, QueryEmptyWarningDirective, QueryEntityDirective, QueryFieldDirective, QueryInputDirective, QueryOperatorDirective, QueryRemoveButtonDirective, QuerySwitchGroupDirective, VALIDATOR };
//# sourceMappingURL=angular2-query-builder.js.map
