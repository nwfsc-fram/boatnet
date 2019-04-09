
<template>
  <div id="app">
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

@media screen and ( min-width: 500px) {
  .centered-page-item {
    text-align: left;
    margin-left: 20px;
  }
}


</style>
