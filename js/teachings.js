const TEACHINGS = ['The Book of Claus', 'Music', 'Recipes'];

function changeTeaching(id) {
  document.getElementById('teaching-title').innerHTML = TEACHINGS[id];

  const contents = document.getElementsByClassName('teaching-content');

  Array.from(contents).forEach((e) => {
    e.classList.add('hidden');
  });

  document.getElementById(`teaching-${id}`).classList.remove('hidden');
}
