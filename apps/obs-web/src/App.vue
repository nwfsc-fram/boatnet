
<template>
  <div id="app">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="../public/img/icons/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="152x152" href="../public/img/icons/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../public/img/icons/apple-icon-180x180.png">
    <link rel="apple-touch-icon" sizes="120x120" href="../public/img/icons/apple-icon-120x120.png">
    <router-view/>
  </div>
</template>

<style>
.centered-page-item {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  letter-spacing: .5px;
}

.q-table th {
    color: #1675d1 !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

.q-table__title {
  font-weight: bold !important;
}

.trip-card {
  margin: 10px;
}

.trip-date {
  width: auto !important;
}

.my-card {
  width: 100%;
  max-width: 450px;
}

@media screen and ( min-width: 500px) {
  .centered-page-item {
    text-align: left;
    margin-left: 20px;
  }
}

@media screen and ( max-width: 450px) {
  .trip-card {
    margin: 10px 0;
  }
}

@media screen and ( min-width: 450px) {
  .trip-date {
    width: 450px !important;
  }
}


</style>
