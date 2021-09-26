const {Firestore} = require('@google-cloud/firestore');
require('dotenv').config();
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const firestore = new Firestore({
    credentials: CREDENTIALS
});

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function vioa(name) {
    const document = firestore.doc(`violation/${name}`);
    const doc = await document.get();
    if (doc._fieldsProto) {
        console.log(doc._fieldsProto)

        let cur_cnt = parseInt(doc._fieldsProto.count.integerValue);
        await document.update({
            count: cur_cnt + 1
        });
        return cur_cnt + 1;
    } else {
        await document.set({
          count: 1
        });
        return 1;
    }
    /*await document.set({
      word: ["abc", "def", "ckg"]
    });
    console.log('Entered new data into the document');*/

    /*await document.update({
      body: 'My first Firestore app',
    });
    console.log('Updated an existing document');*/
    //console.log(doc);
    /*let col = await firestore.listCollections()
    console.log(col.length)
    let res = await deleteCollection(firestore, "test", 5); */
    //console.log("here")
    //await document.delete();
    //console.log('Deleted the document');
}

async function retrieve_proh(type) {
    const document = firestore.doc(`prohibition/${type}`);
    const doc = await document.get();
    if (!doc._fieldsProto) {
        return [];
    } else {
        //console.log(doc._fieldsProto.words.arrayValue.values)
        let retVal = []
        for (let i=0;i<doc._fieldsProto.words.arrayValue.values.length;++i) {
            retVal.push(doc._fieldsProto.words.arrayValue.values[i].stringValue)
        }
        //console.log(retVal)
        return retVal
    }
}

async function add_proh(type, word) {
  const document = firestore.doc(`prohibition/${type}`);
  const doc = await document.get();
  if (!doc._fieldsProto) {
      await document.set({
          words: [word]
      });
  } else {
      //console.log(doc._fieldsProto.words.arrayValue.values)
      let cur_words = []
      for (let i=0;i<doc._fieldsProto.words.arrayValue.values.length;++i) {
          cur_words.push(doc._fieldsProto.words.arrayValue.values[i].stringValue)
      }
      //console.log(cur_words)
      cur_words.push(word)
      await document.update({
          words: cur_words
      });
  }
}

//add_proh("text_proh", "bitch")

//retrieve_proh("text_proh");

async function clear_all() {
    let col = await firestore.listCollections()
    for (let i=0;i<col.length;++i) {
        //console.log(col[i]._queryOptions.collectionId)
        if (col[i]._queryOptions.collectionId === "prohibition") continue;
        deleteCollection(firestore, col[i]._queryOptions.collectionId, 5)
    }
}

//clear_all();

exports.clear_all = clear_all;
exports.vioa = vioa
exports.retrieve_proh = retrieve_proh
exports.add_proh = add_proh