
// GBOS: Generalized Best Order Sort algorithm for non-dominated sorting

"use strict";

function lexicographicSort(solutions,objectiveToSort,m) {
	function lexicographicCompare(s1,s2,idx) {
		while( s1[idx] === s2[idx] ) {
			idx++
			if( idx >= s2.length ) {
				return 0
			}
		}
		return m * (s1[idx] - s2[idx])
	}

	return new Array(solutions.length)
		.fill(0)
		.map( (_,i) => i )
		.sort( (a,b) => lexicographicCompare(solutions[a],solutions[b],objectiveToSort) )
}

function init(solutions,mode) {
	const numObjectives = solutions[0].length
	const numSolutions = solutions.length

	let comparisonSet = new Array(numSolutions)
		.fill( [...Array(numObjectives).keys()] )
		
	let sortedSolutions = new Array(numObjectives)
		.fill(null)
		.map( (_,i) => lexicographicSort(solutions,i,mode) )

	let ranks = new Array(numSolutions)
		.fill(-1) 

	let list = new Array(numObjectives)
		.fill([])

	let sameAs = new Array(numSolutions)
		.fill(null)

	return {
		comparisonSet,
		sortedSolutions,
		ranks,
		list,
		sameAs,
		RC: 0, // # of ranks discovered
	}
}

function add(list,rank,solution) {
	// allocate empty arrays for any non-existent ranks
	while(list[rank] === undefined ) { 
		list.push([]) 
	}

	list[rank].push(solution)
}

function dominationCheck(s,t,comparisonSet) {
	return comparisonSet
		.filter( i => i > -1 )
		.every( i => t[i] < s[i]) 
}

function findRank(list,solution,o) {
	function checkRank() {
		if( o.sameAs[solution] ) {
			return o.ranks[o.sameAs[solution]]
		}

		for( let k = 0; k < o.RC; k++ ) {
			if( !list[k].some( t => dominationCheck(solution,t,o.comparisonSet[t]) ) ) {
				return k
			}
		}
		return o.RC++
	}

	add(list,(o.ranks[solution]=checkRank()),solution)
}

function sort(solutions,o) {
	function isSame(a,b) {
		return a.every( (_,i) => a[i] === b[i] )
	}

	// scan & index duplicate solutions
	for( let i=1; i<solutions.length; i++) {
		const sCurrent = o.sortedSolutions[0][i]
		const sPrevious = o.sortedSolutions[0][i-1]
		if( isSame(solutions[sCurrent],solutions[sPrevious])) {
			o.sameAs[sCurrent] = sPrevious
		}
	}

	for( let i in solutions ) {
		for( let j in o.sortedSolutions ) {
			const solution = o.sortedSolutions[j][i]
			o.comparisonSet[solution][j] = -1 // exclude objective j from solution's comparison set
			if( o.ranks[solution] >= 0 ) { // already ranked
				add(o.list[j],o.ranks[solution],solution)
			}
			else if( !(o.sameAs[solution] && o.ranks[o.sameAs[solution]] === -1) ) { // don't bother if sameAs[]'s rank hasn't been found yet
				findRank(o.list[j],solution,o)
			}
		}
	}

	return o.ranks
}

function generalizedBestOrderSort(solutions,mode) {
	return sort(solutions,init(solutions,mode))
}

module.exports = generalizedBestOrderSort