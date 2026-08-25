document.addEventListener("DOMContentLoaded", function() {

    console.log("Hello! This is your javascript file."); 

    const examplearray =[
        {date: "2026-08-23", sleep: 7, moods:["energetic", "motivated"]},
        {date: "2026-08-22", sleep: 5, moods:["anxious"]},
        {date: "2026-08-21", sleep: 8, moods:["motivated"]},
        {date: "2026-08-20", sleep: 6, moods:["anxious", "energetic"]},
        {date: "2026-08-19", sleep: 7, moods:["motivated", "energetic"]},
    ];

    // console.log("Example array:", examplearray);


    const avgSleepElement = document.getElementById("avgsleep");
    const energeticElement = document.getElementById("energeticCount");
    const anxiousElement = document.getElementById("anxiousCount");
    const motivatedElement = document.getElementById("motivatedCount");
    const sleeprange = document.getElementById("sleeprange");

    const sleeptext = document.querySelector(".sleeprecord p"); 
    const moodselect = document.querySelector(".mood"); 

    function updateSummary() {
        const currentSleep = parseInt(sleeprange.value);
        
        // get current moods 
        const currentMoods = Array.from(moodselect.querySelectorAll('input[name="moodselect"]:checked'))
        .map(input => input.value);

        sleeptext.textContent = `Sleep Record: ${currentSleep} hours`;

        const newEntry = {
            date: new Date().toISOString().split('T')[0],
            sleep: currentSleep,
            moods: currentMoods
        };

        const allEntries = [...examplearray, newEntry];

        // sum and everage sleep calculation
        const totalSleep = allEntries.reduce((sum, entry) => sum + entry.sleep, 0);
        const calculatedAvgSleep = (totalSleep / allEntries.length).toFixed(1); 
        

        const moodCounts = allEntries.reduce((acc, entry) => {
            
            if (entry.moods.includes("energetic")) acc.energetic++;
            if (entry.moods.includes("anxious")) acc.anxious++;
            if (entry.moods.includes("motivated")) acc.motivated++;
            
            return acc; 
        }, { energetic: 0, anxious: 0, motivated: 0 }); 
        
        // html update
        avgSleepElement.textContent = calculatedAvgSleep;
        energeticElement.textContent = moodCounts.energetic;
        anxiousElement.textContent = moodCounts.anxious;
        motivatedElement.textContent = moodCounts.motivated;

        // console.log("Updated Summary:", {
        //     averageSleep: calculatedAvgSleep,
        //     moodCounts: moodCounts
        // });
    }

    // Event listners 
    sleeprange.addEventListener("input", updateSummary);


    const checkboxes = moodselect.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(item => item.addEventListener("change", updateSummary));


// Initial
    updateSummary();

});