export default function prismaHelpers(hb: any) {
  hb.registerHelper('joinFieldMarks', function (marks: any) {
    if (typeof marks === 'string') return marks
    return marks.map((x: any) => x._).join(' ')
  });

  hb.registerHelper('capitalize', function (model: string){
    return model[0].toUpperCase() + model.slice(1)
  })
}