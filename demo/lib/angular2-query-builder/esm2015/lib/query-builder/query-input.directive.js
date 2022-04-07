import { Directive, Input, TemplateRef } from '@angular/core';
export class QueryInputDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktaW5wdXQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9uZW9zaXMvcHJvamVjdHMvQW5ndWxhci1RdWVyeUJ1aWxkZXIvcHJvamVjdHMvYW5ndWxhcjItcXVlcnktYnVpbGRlci9zcmMvIiwic291cmNlcyI6WyJsaWIvcXVlcnktYnVpbGRlci9xdWVyeS1pbnB1dC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzlELE1BQU0sT0FBTyxtQkFBbUI7SUFZOUIsWUFBbUIsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDO0lBWGpELHdDQUF3QztJQUN4QyxJQUNJLGNBQWMsS0FBYSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25ELElBQUksY0FBYyxDQUFDLEtBQWE7UUFDOUIsMEZBQTBGO1FBQzFGLHVGQUF1RjtRQUN2RixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7OztZQVZGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUM7OztZQUZWLFdBQVc7Ozs2QkFLbkMsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5wdXQsIFRlbXBsYXRlUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW3F1ZXJ5SW5wdXRdJ30pXG5leHBvcnQgY2xhc3MgUXVlcnlJbnB1dERpcmVjdGl2ZSB7XG4gIC8qKiBVbmlxdWUgbmFtZSBmb3IgcXVlcnkgaW5wdXQgdHlwZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHF1ZXJ5SW5wdXRUeXBlKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl90eXBlOyB9XG4gIHNldCBxdWVyeUlucHV0VHlwZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gSWYgdGhlIGRpcmVjdGl2ZSBpcyBzZXQgd2l0aG91dCBhIHR5cGUgKHVwZGF0ZWQgcHJvZ3JhbWF0aWNhbGx5KSwgdGhlbiB0aGlzIHNldHRlciB3aWxsXG4gICAgLy8gdHJpZ2dlciB3aXRoIGFuIGVtcHR5IHN0cmluZyBhbmQgc2hvdWxkIG5vdCBvdmVyd3JpdGUgdGhlIHByb2dyYW1hdGljYWxseSBzZXQgdmFsdWUuXG4gICAgaWYgKCF2YWx1ZSkgeyByZXR1cm47IH1cbiAgICB0aGlzLl90eXBlID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfdHlwZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cbiJdfQ==