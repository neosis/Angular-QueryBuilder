import { Directive, TemplateRef } from '@angular/core';
export class QueryEntityDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktZW50aXR5LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvbmVvc2lzL3Byb2plY3RzL0FuZ3VsYXItUXVlcnlCdWlsZGVyL3Byb2plY3RzL2FuZ3VsYXIyLXF1ZXJ5LWJ1aWxkZXIvc3JjLyIsInNvdXJjZXMiOlsibGliL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktZW50aXR5LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUd2RCxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLFlBQW1CLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQzs7O1lBRmxELFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUM7OztZQUZsQixXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1txdWVyeUVudGl0eV0nfSlcbmV4cG9ydCBjbGFzcyBRdWVyeUVudGl0eURpcmVjdGl2ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cbiJdfQ==