const ctx = document.getElementById('graph');

const chart = new window.Chart(ctx, {
    // 縦棒グラフ
    type: 'bar',
    data: {
        labels: ['a', 'b', 'c', 'd', 'e', 'f'],
        datasets: [{
            label: '# of lines',
            data: sabun,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            xAxes: [{
                display: true,
                labelString: '横',
                ticks: {
                    beginAtZero: true
                }
            }],
            yAxes: [{
                display: true,
                labelString: '縦',
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }

    // 線グラフ
    // type: 'line',
    // data: {
    //     labels: ["Mon","Tue","Wed","Thu","Fir","Sat","Sun"],
    //     datasets: [{
    //             label: "Demo line plot",
    //             backgroundColor: "#008080",
    //             borderColor: "#7fffd4",
    //             pointBorderWidth: 10,
    //             data: [5,6,9,15,30,40,80]
    //     }]
    // }

    // 散布図
    // type: 'scatter',
    // datasets: [{

    // }]


});