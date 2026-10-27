(function(root){
'use strict';
const roles=[
 {id:'cfo',name:'Elena Brooks',title:'Chief financial officer',short:'CFO',purpose:'Decide whether August earnings and the near-term cash outlook call for a management response.',duties:['Reviews operating income against plan and the share of sales retained after production and operating costs.','Discusses the principal earnings changes and their concentration by plant at the monthly leadership meeting.','Decides whether financing or payment timing needs attention during the next four weeks. Treasury handles individual collections.']},
 {id:'controller',name:'Renee Vance',title:'Controller',short:'Controller',purpose:'Decide where to direct accounting follow-up before the August reporting package is finalized.',duties:['Reviews operating expense against budget and identifies which expense accounts need follow-up.','Checks agreement between posted expense balances and source-system totals, with enough detail to assign unresolved differences.','Monitors completion of the August close and decides which accounting teams need help.']},
 {id:'operations',name:'Priya Shah',title:'Plant operations manager',short:'Operations',purpose:'Decide which plant production costs need attention at the weekly operating review.',duties:['Compares production cost per unit with plan and identifies where the plant differences are concentrated.','Reviews the cost of scrapped production and its recent movement.','Reviews overtime cost and its recent movement before discussing staffing or process changes with plant supervisors.']}
];
const m=(id,title,type,format,definition,source)=>({id,title,type,format,definition,source});
const catalog=[
 m('op_income','Operating income','KPI','money','Net sales less cost of goods sold and operating expense; compared with the August budget.','balances'),
 m('op_margin','Operating margin','KPI','percent','Operating income divided by net sales; compared with budget. This includes operating expenses.','balances'),
 m('cash_headroom','Minimum forecast cash headroom','KPI','money','Lowest forecast ending cash across four weeks less the $700,000 minimum. A negative value is a gap.','cash_forecast'),
 m('income_bridge','Budget to actual operating income','Chart','bridge','A waterfall connects budget operating income to actual through net sales, production costs, and operating expense.','balances'),
 m('profit_bar','Operating income by plant','Chart','bar','Bars compare actual and budget operating income for each plant.','balances'),
 m('profit_dot','Operating income by plant','Chart','dot','Paired dots compare actual and budget operating income for each plant.','balances'),
 m('cash_line','Four week cash outlook','Chart','line','Base forecast of ending cash against the company minimum by week.','cash_forecast'),
 m('expense_variance','Operating expense variance','KPI','money','Actual distribution, selling, and administration expense less budget. Positive means expense above plan.','balances'),
 m('recon_gap','Unresolved reconciliation amount','KPI','money','Sum of the absolute differences between posted operating expense and source totals.','reconciliations'),
 m('close_progress','Close completion','KPI','percent','Completed August close tasks divided by all August close tasks.','close_tasks'),
 m('account_bar','Expense variance by account','Chart','bar','Actual less budget for each operating expense account. Positive is above plan.','balances'),
 m('account_dot','Expense variance by account','Chart','dot','A dot for each operating expense account’s actual less budget. Zero is the reference.','balances'),
 m('recon_table','Expense reconciliation detail','Table','table','Posted and source amounts by expense account, signed differences, and responsible teams.','reconciliations'),
 m('close_tasks','Close tasks by accounting area','Chart','stack','Completed and open tasks in each accounting area.','close_tasks'),
 m('unit_variance','Production cost per unit variance','KPI','unit','Company cost of goods sold divided by actual units, less budget cost of goods sold divided by planned units.','balances + production'),
 m('scrap_cost','Scrap cost','KPI','money','Production scrap account balance for August; compared with budget. Scrap is included in production cost.','balances'),
 m('overtime_cost','Overtime cost','KPI','money','Production overtime account balance for August; compared with budget. Overtime is included in production cost.','balances'),
 m('unit_bar','Production cost per unit by plant','Chart','bar','Actual and planned cost of goods sold per unit by plant.','balances + production'),
 m('unit_dot','Production cost per unit by plant','Chart','dot','Paired dots compare actual and planned production cost per unit by plant.','balances + production'),
 m('scrap_line','Monthly scrap cost','Chart','line','Company scrap cost for April through August; each point is a separate monthly amount.','balances'),
 m('overtime_line','Monthly overtime cost','Chart','line','Company overtime cost for April through August; each point is a separate monthly amount.','balances'),
 m('production_table','Production volumes by plant','Table','table','Actual and planned August production units for each plant.','production'),
 m('sales','Net sales','KPI','money','August net sales compared with budget, before production and operating costs.','balances'),
 m('sales_line','Monthly net sales','Chart','line','Company net sales for April through August.','balances'),
 m('gross_margin','Gross margin','KPI','percent','Net sales less cost of goods sold, divided by net sales.','balances'),
 m('headcount','Employee headcount','KPI','number','Number of employees at August 31.','context'),
 m('web','Website visits','KPI','number','August website sessions; a visitor may create multiple sessions.','context'),
 m('warehouse','Warehouse floor area','KPI','area','Total warehouse floor space in square feet.','context'),
 m('cash_now','Current cash balance','KPI','money','Cash available at September 11.','context')
];
const ids=new Set(catalog.map(x=>x.id)),roleIds=roles.map(x=>x.id);
const rules={
 cfo:{primary:['op_income','op_margin','cash_headroom'],support:[['income_bridge'],['profit_bar','profit_dot'],['cash_line']],optional:['sales','sales_line','gross_margin','cash_now','expense_variance','account_bar','account_dot','unit_variance','unit_bar','unit_dot','scrap_cost','scrap_line','overtime_cost','overtime_line','production_table'],priorityGroups:[['op_income','op_margin','income_bridge','profit_bar','profit_dot'],['cash_headroom','cash_line']]},
 controller:{primary:['expense_variance','recon_gap','close_progress'],support:[['account_bar','account_dot'],['recon_table'],['close_tasks']],optional:['op_income','op_margin','income_bridge','sales','sales_line','gross_margin'],priorityGroups:[['expense_variance','account_bar','account_dot'],['recon_gap','recon_table'],['close_progress','close_tasks']]},
 operations:{primary:['unit_variance','scrap_cost','overtime_cost'],support:[['unit_bar','unit_dot'],['scrap_line'],['overtime_line']],optional:['production_table','headcount','gross_margin'],priorityGroups:[['unit_variance','unit_bar','unit_dot'],['scrap_cost','scrap_line'],['overtime_cost','overtime_line']]}
};
const equivalentComparisons=[['profit_bar','profit_dot'],['account_bar','account_dot'],['unit_bar','unit_dot']];
const feedback={
 coverage:'The view does not yet support the full range of recurring responsibilities. Revisit the brief and consider which decisions remain difficult.',
 relevance:'Some information has a weak connection to this user’s recurring work. Consider what decision each tile helps the user make.',
 redundancy:'Some tiles repeat the same comparison. Keep the presentation that communicates it most clearly.',
 priority:'The layout does not yet give appropriate priority to the user’s decisions. Review how the rows distinguish key decisions, essential detail, and additional context.'
};
function blank(){return{schema:1,active:'cfo',designs:Object.fromEntries(roleIds.map(id=>[id,{tiles:[],checked:false}]))};}
function validate(input){
 if(!input||input.schema!==1||!roleIds.includes(input.active)||!input.designs||typeof input.designs!=='object')throw Error('This file is not a Dashboard Studio work file.');
 const result=blank();result.active=input.active;
 for(const id of roleIds){const d=input.designs[id];if(!d||!Array.isArray(d.tiles)||d.tiles.length>9||(d.note!==undefined&&(typeof d.note!=='string'||d.note.length>2000)))throw Error('This work file contains an invalid dashboard.');
 const seen=new Set(),positions=new Set();for(const t of d.tiles){if(!t||!ids.has(t.id)||!Number.isInteger(t.position)||t.position<0||t.position>8||seen.has(t.id)||positions.has(t.position))throw Error('This work file contains an invalid tile or position.');seen.add(t.id);positions.add(t.position);}
 result.designs[id]={tiles:d.tiles.map(t=>({id:t.id,position:t.position})),checked:d.checked===true};if(d.note!==undefined)result.designs[id].note=d.note;}
 return result;
}
function check(role,tiles){
 const rule=rules[role];if(!rule)throw Error('Unknown user');
 if(!Array.isArray(tiles))throw Error('Invalid tiles');
 if(tiles.some(t=>!t||!ids.has(t.id)||!Number.isInteger(t.position)||t.position<0||t.position>8)||new Set(tiles.map(t=>t.id)).size!==tiles.length||new Set(tiles.map(t=>t.position)).size!==tiles.length)return{pass:false,hints:['Review the saved dashboard layout before checking it again.'],issues:['invalid']};
 const chosen=new Set(tiles.map(t=>t.id)),core=new Set([...rule.primary,...rule.support.flat()]),allowed=new Set([...core,...rule.optional]),issues=[];
 if(rule.primary.some(id=>!chosen.has(id))||rule.support.some(group=>!group.some(id=>chosen.has(id))))issues.push('coverage');
 if(tiles.some(t=>!allowed.has(t.id)))issues.push('relevance');
 if(equivalentComparisons.some(group=>group.filter(id=>chosen.has(id)).length>1))issues.push('redundancy');
 const first=tiles.filter(t=>t.position<3),firstIds=new Set(first.map(t=>t.id));
 if(first.length!==3||first.some(t=>!core.has(t.id))||rule.priorityGroups.some(group=>!group.some(id=>firstIds.has(id)))||tiles.some(t=>(core.has(t.id)&&t.position>5)||(rule.optional.includes(t.id)&&t.position<6)))issues.push('priority');
 return{pass:issues.length===0,hints:issues.slice(0,3).map(issue=>feedback[issue]),issues};
}
const sum=(rows,field)=>rows.reduce((v,r)=>v+Number(r[field]),0);
function model(tables){
 const groups=Object.fromEntries(tables.accounts.map(r=>[r.id,r.group]));
 const periods=[...new Set(tables.balances.map(r=>r.period))].sort();const plants=[...new Set(tables.production.map(r=>r.plant))];
 function totals(period='2025-08',plant=null){const rows=tables.balances.filter(r=>r.period===period&&(!plant||r.plant===plant));const prod=tables.production.filter(r=>r.period===period&&(!plant||r.plant===plant));const out={};
 for(const field of ['actual','budget']){const value=g=>sum(rows.filter(r=>groups[r.account]===g),field);const rev=value('Revenue'),cogs=value('Cost of goods sold'),opex=value('Operating expense');const op=rev-cogs-opex,units=sum(prod,field==='actual'?'units':'planned_units');out[field]={revenue:rev,cogs,opex,income:op,margin:op/rev,gross:(rev-cogs)/rev,units,unit:cogs/units,scrap:sum(rows.filter(r=>r.account==='5200'),field),overtime:sum(rows.filter(r=>r.account==='5300'),field)};}return out;}
 const august=totals();const cash=tables.cash_forecast;const minRow=cash.reduce((a,b)=>a.ending-a.minimum<b.ending-b.minimum?a:b);
 return{tables,periods,plants,totals,august,minRow,reconciliationGap:tables.reconciliations.reduce((n,r)=>n+Math.abs(r.ledger_amount-r.source_amount),0),complete:tables.close_tasks.filter(r=>r.status==='Complete').length/tables.close_tasks.length};
}
function visual(id,db){const a=db.august.actual,b=db.august.budget,tab=db.tables;let result={};
 const card=(value,comparison,unit='money')=>({kind:'kpi',value,comparison,unit});
 const series=(rows,columns,unit='money',mode='bar')=>({kind:'chart',rows,columns,unit,mode});
 const labels={op_income:()=>card(a.income,`Budget ${money(b.income)} · ${signed(a.income-b.income)} vs plan`),op_margin:()=>card(a.margin,`Budget ${pct(b.margin)} · ${((a.margin-b.margin)*100).toFixed(1)} percentage points`,'percent'),cash_headroom:()=>card(db.minRow.ending-db.minRow.minimum,`Week ending ${shortDate(db.minRow.week)} · Minimum ${money(db.minRow.minimum)} · Forecast`),expense_variance:()=>card(a.opex-b.opex,`Actual ${money(a.opex)} · Budget ${money(b.opex)} · Positive is above plan`),recon_gap:()=>card(db.reconciliationGap,'Absolute unresolved differences · 3 expense accounts'),close_progress:()=>card(db.complete,`${tab.close_tasks.filter(r=>r.status==='Complete').length} of ${tab.close_tasks.length} August tasks complete`,'percent'),unit_variance:()=>card(a.unit-b.unit,`Actual ${money(a.unit,2)} · Plan ${money(b.unit,2)} per unit · Positive is above plan`,'unit'),scrap_cost:()=>card(a.scrap,`Budget ${money(b.scrap)} · ${signed(a.scrap-b.scrap)} vs plan`),overtime_cost:()=>card(a.overtime,`Budget ${money(b.overtime)} · ${signed(a.overtime-b.overtime)} vs plan`),sales:()=>card(a.revenue,`Budget ${money(b.revenue)}`),gross_margin:()=>card(a.gross,`Budget ${pct(b.gross)} · Before operating expense`,'percent'),headcount:()=>card(tab.context[1].headcount,'Employees at August 31','number'),web:()=>card(tab.context[1].website_sessions,'August sessions · Repeat visits included','number'),warehouse:()=>card(tab.context[1].warehouse_area_sqft,'Square feet · All warehouses','area'),cash_now:()=>card(tab.context[1].cash_now,'At September 11 · Forecast starting cash')};
 if(labels[id])return labels[id]();
 if(['profit_bar','profit_dot','unit_bar','unit_dot'].includes(id)){const unit=id.startsWith('unit');result=series(db.plants.map(p=>{const v=db.totals('2025-08',p);return{label:p,actual:unit?v.actual.unit:v.actual.income,budget:unit?v.budget.unit:v.budget.income};}),[{key:'actual',label:'Actual'},{key:'budget',label:'Budget'}],unit?'unit':'money',id.endsWith('dot')?'dot':'bar');}
 else if(id==='income_bridge')result=series([{label:'Budget',value:b.income,total:true},{label:'Net sales',value:a.revenue-b.revenue},{label:'Production costs',value:b.cogs-a.cogs},{label:'Operating expense',value:b.opex-a.opex},{label:'Actual',value:a.income,total:true}],[{key:'value',label:'Amount'}],'money','bridge');
 else if(id==='cash_line')result=series(tab.cash_forecast.map(r=>({label:shortDate(r.week),ending:r.ending,minimum:r.minimum})),[{key:'ending',label:'Forecast'},{key:'minimum',label:'Minimum'}],'money','line');
 else if(['account_bar','account_dot'].includes(id))result=series(tab.accounts.filter(r=>r.group==='Operating expense').map(r=>({label:r.name,value:sum(tab.balances.filter(x=>x.account===r.id&&x.period==='2025-08'),'actual')-sum(tab.balances.filter(x=>x.account===r.id&&x.period==='2025-08'),'budget')})),[{key:'value',label:'Actual less budget'}],'money',id.endsWith('dot')?'dot':'bar');
 else if(id==='recon_table')result={kind:'table',columns:['Account','Posted USD','Source USD','Difference USD','Owner'],rows:tab.reconciliations.map(r=>[tab.accounts.find(x=>x.id===r.account).name,r.ledger_amount,r.source_amount,r.ledger_amount-r.source_amount,r.owner])};
 else if(id==='production_table')result={kind:'table',columns:['Plant','Actual units','Planned units','Actual less plan'],rows:db.plants.map(plant=>{const v=db.totals('2025-08',plant);return[plant,v.actual.units,v.budget.units,v.actual.units-v.budget.units];})};
 else if(id==='close_tasks')result=series([...new Set(tab.close_tasks.map(r=>r.area))].map(area=>({label:area,complete:tab.close_tasks.filter(r=>r.area===area&&r.status==='Complete').length,open:tab.close_tasks.filter(r=>r.area===area&&r.status==='Open').length})),[{key:'complete',label:'Complete'},{key:'open',label:'Open'}],'number','stack');
 else if(['scrap_line','overtime_line','sales_line'].includes(id)){const field={scrap_line:'scrap',overtime_line:'overtime',sales_line:'revenue'}[id];result=series(db.periods.map(p=>({label:month(p),value:db.totals(p).actual[field]})),[{key:'value',label:'Actual'}],'money','line');}
 else throw Error('Unknown visual');
 return result;
}
function money(n,d=0){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:d,minimumFractionDigits:d}).format(n);}
function signed(n){return(n>=0?'+':'−')+money(Math.abs(n));}function pct(n){return(n*100).toFixed(1)+'%';}function shortDate(s){return new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});}function month(s){return new Date(s+'-01T12:00:00').toLocaleDateString('en-US',{month:'short'});}
const API={roles,catalog,blank,validate,check,model,visual,money,pct};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.Calder=API;
})(typeof window!=='undefined'?window:globalThis);
