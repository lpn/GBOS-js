test = require('../index.js')
assert = require('assert')

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};

function genTestData(num,objectives,clones,rand) {
	let genObjs = (n,scale) => new Array(n).fill(0).map( _ => (rand()*scale)) 
	
	let d = new Array(num).fill(0).map( (i,index) => genObjs(objectives,2/(index+1)) )
	let da = new Array(clones).fill(0).map( _ => d[Math.floor(rand()*d.length)] )

	return [...d,...da]
}

function testRanks(ranks,data) {
	let compare = (a,b) => a.some( (_,i) => a[i] <= b[i])
	
	return ranks.every( (rank,i) => 
		ranks.every( (r,j) => {
			return rank>=r?true:compare(data[i],data[j])
		})
	)
}

function mkTest(solutions,dim) {
	let wew = i => i>1?'s':''
	let s = (r,data,m) => r(data,m?m:1)
	describe(`${solutions} Solution${wew(solutions)}, ${dim} Objective${wew(dim)}`, function() {
		it('higher ranks should contain larger values than lower ranks', function() {
			assert( new Array(Math.floor(Math.max(1,2*16384/(solutions*dim)))).fill(0).every( _ => {
				const data = genTestData(solutions-(solutions>>4),dim,(solutions>>4),Math.seed(solutions*dim+dim))
				return testRanks(s(test,data),data)
			}))
		});
	});
}

describe('BOS Rank Sequentiality Test', function() {
	this.timeout(0)
	for( let i=0;i<10;i++ ) {
		for( let j=0; j<15; j++) {
			mkTest(1<<j,1<<i) 
		}
	}
});

