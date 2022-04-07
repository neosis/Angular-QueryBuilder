import { Directive, TemplateRef } from '@angular/core';
export class QueryFieldDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktZmllbGQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9uZW9zaXMvcHJvamVjdHMvQW5ndWxhci1RdWVyeUJ1aWxkZXIvcHJvamVjdHMvYW5ndWxhcjItcXVlcnktYnVpbGRlci9zcmMvIiwic291cmNlcyI6WyJsaWIvcXVlcnktYnVpbGRlci9xdWVyeS1maWVsZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHdkQsTUFBTSxPQUFPLG1CQUFtQjtJQUM5QixZQUFtQixRQUEwQjtRQUExQixhQUFRLEdBQVIsUUFBUSxDQUFrQjtJQUFHLENBQUM7OztZQUZsRCxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsY0FBYyxFQUFDOzs7WUFGakIsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgVGVtcGxhdGVSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcXVlcnlGaWVsZF0nfSlcbmV4cG9ydCBjbGFzcyBRdWVyeUZpZWxkRGlyZWN0aXZlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+KSB7fVxufVxuIl19